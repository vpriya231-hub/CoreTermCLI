package com.coreterm.cli.ui

import android.content.Context
import android.view.KeyEvent
import android.view.inputmethod.InputMethodManager
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.focusable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.input.key.*
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.ExperimentalTextApi
import androidx.compose.ui.text.TextMeasurer
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.draw.alpha
import com.coreterm.cli.session.TerminalSession

/**
 * Custom Color Scheme for Terminal rendering.
 */
data class TerminalColorScheme(
    val background: Color = Color(0xFF282A36), // Dracula BG
    val defaultText: Color = Color(0xFFF8F8F2), // Dracula FG
    val cursorColor: Color = Color(0xFF50FA7B), // Dracula Green
    val ansiColors: List<Color> = listOf(
        Color(0xFF21222C), // Black
        Color(0xFFFF5555), // Red
        Color(0xFF50FA7B), // Green
        Color(0xFFF1FA8C), // Yellow
        Color(0xFFBD93F9), // Blue
        Color(0xFFFF79C6), // Magenta
        Color(0xFF8BE9FD), // Cyan
        Color(0xFFF8F8F2)  // White
    )
)

/**
 * Model of a single Character Cell within the Grid Buffer.
 */
data class TerminalCell(
    val char: Char = ' ',
    val fgColorIndex: Int = 7, // Default White
    val bgColorIndex: Int = -1, // -1 represents Transparent/Default BG
    val isBlinking: Boolean = false,
    val isBold: Boolean = false
)

/**
 * Simplified representation of a terminal screen buffer.
 */
class TerminalBuffer(val maxRows: Int, val maxCols: Int) {
    private val buffer = Array(maxRows) { Array(maxCols) { TerminalCell() } }
    
    fun getCell(row: Int, col: Int): TerminalCell {
        if (row in 0 until maxRows && col in 0 until maxCols) {
            return buffer[row][col]
        }
        return TerminalCell()
    }
    
    fun setCell(row: Int, col: Int, cell: TerminalCell) {
        if (row in 0 until maxRows && col in 0 until maxCols) {
            buffer[row][col] = cell
        }
    }
}

/**
 * Terminal UI Container aligning Terminal view with Extra Keys Row overlay.
 */
@Composable
fun TerminalScreenContainer(
    session: TerminalSession,
    modifier: Modifier = Modifier,
    colorScheme: TerminalColorScheme = TerminalColorScheme()
) {
    val context = LocalContext.current
    val focusRequester = remember { FocusRequester() }
    var isCtrlPressed by remember { mutableStateOf(false) }
    var isAltPressed by remember { mutableStateOf(false) }
    var isFnPressed by remember { mutableStateOf(false) }
    var textFieldValue by remember { mutableStateOf(TextFieldValue("")) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(colorScheme.background)
    ) {
        // Invisible input bridge to drive soft keyboard character processing
        Box(
            modifier = Modifier.size(0.dp)
        ) {
            BasicTextField(
                value = textFieldValue,
                onValueChange = { newValue ->
                    val prevText = textFieldValue.text
                    val newText = newValue.text
                    if (newText.length > prevText.length) {
                        val addedText = newText.substring(prevText.length)
                        for (i in 0 until addedText.length) {
                            val char = addedText[i]
                            if (char == '\n') {
                                session.write(byteArrayOf(13)) // Send CR (Enter) \r
                            } else {
                                session.write(char.toString().toByteArray(Charsets.UTF_8))
                            }
                        }
                    } else if (newText.length < prevText.length) {
                        session.write(byteArrayOf(127)) // ASCII standard DEL / Backspace
                    }
                    textFieldValue = TextFieldValue("")
                },
                modifier = Modifier
                    .size(1.dp)
                    .alpha(0f)
                    .focusRequester(focusRequester),
                keyboardOptions = KeyboardOptions(
                    capitalization = KeyboardCapitalization.None,
                    autoCorrect = false,
                    keyboardType = KeyboardType.Ascii,
                    imeAction = ImeAction.None
                ),
                keyboardActions = KeyboardActions(
                    onAny = {
                        session.write(byteArrayOf(13)) // Enter key: \r
                    }
                )
            )
        }

        // 1. Interactive Canvas Terminal (Occupies maximum available area)
        TerminalCanvas(
            session = session,
            colorScheme = colorScheme,
            isCtrlActive = isCtrlPressed,
            isAltActive = isAltPressed,
            onModifiersStateChanged = { ctrl, alt ->
                isCtrlPressed = ctrl
                isAltPressed = alt
            },
            modifier = Modifier
                .weight(1f)
                .clickable {
                    focusRequester.requestFocus()
                    // Proactively request the system soft keyboard to manifest
                    val imm = context.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
                    imm.showSoftInput(null, InputMethodManager.SHOW_IMPLICIT)
                }
        )

        // 2. Extra Keys Row Overlay for mobile ergonomics
        ExtraKeysRow(
            isCtrlPressed = isCtrlPressed,
            isAltPressed = isAltPressed,
            isFnPressed = isFnPressed,
            onKeyAction = { action ->
                when (action) {
                    "ESC" -> session.write(byteArrayOf(27)) // Escape byte \u001B
                    "TAB" -> session.write(byteArrayOf(9))  // Tab byte \t
                    "CTRL" -> isCtrlPressed = !isCtrlPressed
                    "ALT" -> isAltPressed = !isAltPressed
                    "FN" -> isFnPressed = !isFnPressed
                    "-" -> session.write(byteArrayOf(45))  // Hyphen '-'
                    "▲" -> session.write(byteArrayOf(27, 91, 65)) // Arrow Up: ESC [ A
                    "▼" -> session.write(byteArrayOf(27, 91, 66)) // Arrow Down: ESC [ B
                    "◀" -> session.write(byteArrayOf(27, 91, 68)) // Arrow Left: ESC [ D
                    "▶" -> session.write(byteArrayOf(27, 91, 67)) // Arrow Right: ESC [ C
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF1E1F29))
                .padding(vertical = 4.dp, horizontal = 8.dp)
        )
    }

    // Force focus selection upon creation
    LaunchedEffect(Unit) {
        focusRequester.requestFocus()
    }
}

/**
 * 120Hz Hardware Accelerated Canvas displaying Termux character arrays.
 */
@OptIn(ExperimentalTextApi::class, ExperimentalComposeUiApi::class)
@Composable
fun TerminalCanvas(
    session: TerminalSession,
    colorScheme: TerminalColorScheme,
    isCtrlActive: Boolean,
    isAltActive: Boolean,
    onModifiersStateChanged: (Boolean, Boolean) -> Unit,
    modifier: Modifier = Modifier
) {
    val textMeasurer = rememberTextMeasurer()
    val scrollState = rememberScrollState()

    // Example simulated layout dimension states
    val rows = 40
    val cols = 80
    val terminalBuffer = remember { TerminalBuffer(rows, cols) }
    var cursorRow by remember { mutableStateOf(0) }
    var cursorCol by remember { mutableStateOf(0) }

    Canvas(
        modifier = modifier
            .fillMaxSize()
            .focusable()
            .onKeyEvent { keyEvent ->
                if (keyEvent.type != KeyEventType.KeyDown) return@onKeyEvent false

                val nativeEvent = keyEvent.nativeKeyEvent
                val keyCode = nativeEvent.keyCode
                val unicodeChar = nativeEvent.getUnicodeChar(nativeEvent.metaState)

                var handled = false
                
                // Track modifiers configuration
                var ctrlModifier = isCtrlActive || keyEvent.isCtrlPressed
                var altModifier = isAltActive || keyEvent.isAltPressed

                if (ctrlModifier && unicodeChar in 97..122) { // 'a'..'z' control signals
                    // Ctrl + Key produces standard codes (\x01 - \x1A)
                    val controlByte = (unicodeChar - 96).toByte()
                    session.write(byteArrayOf(controlByte))
                    
                    // Consume one-shot software modifier states
                    onModifiersStateChanged(false, false)
                    handled = true
                } else if (altModifier && unicodeChar != 0) {
                    // Alt + Key prepends an ESC byte prefix (\x1B + key)
                    session.write(byteArrayOf(27, unicodeChar.toByte()))
                    onModifiersStateChanged(false, false)
                    handled = true
                } else if (unicodeChar != 0) {
                    // Standard ASCII character payload
                    session.write(byteArrayOf(unicodeChar.toByte()))
                    handled = true
                } else {
                    // Translate explicit system arrow navigation commands
                    when (keyCode) {
                        KeyEvent.KEYCODE_DPAD_UP -> {
                            session.write(byteArrayOf(27, 91, 65)) // ESC [ A
                            handled = true
                        }
                        KeyEvent.KEYCODE_DPAD_DOWN -> {
                            session.write(byteArrayOf(27, 91, 66)) // ESC [ B
                            handled = true
                        }
                        KeyEvent.KEYCODE_DPAD_LEFT -> {
                            session.write(byteArrayOf(27, 91, 68)) // ESC [ D
                            handled = true
                        }
                        KeyEvent.KEYCODE_DPAD_RIGHT -> {
                            session.write(byteArrayOf(27, 91, 67)) // ESC [ C
                            handled = true
                        }
                        KeyEvent.KEYCODE_ENTER -> {
                            session.write(byteArrayOf(13)) // carriage return \r
                            handled = true
                        }
                        KeyEvent.KEYCODE_DEL -> {
                            session.write(byteArrayOf(127)) // standard backspace deletion ascii code
                            handled = true
                        }
                    }
                }
                handled
            }
    ) {
        val charWidth = 9.dp.toPx() // Approximation of mono-spaced baseline scaling
        val charHeight = 18.dp.toPx()

        // 1. Clear viewport with background color
        drawRect(color = colorScheme.background)

        // 2. Loop and render our active physical character buffers
        for (r in 0 until rows) {
            for (c in 0 until cols) {
                val cell = terminalBuffer.getCell(r, c)
                val x = c * charWidth
                val y = r * charHeight

                // Draw cell-specific custom background if active
                if (cell.bgColorIndex != -1) {
                    val bgCol = colorScheme.ansiColors.getOrElse(cell.bgColorIndex) { colorScheme.background }
                    drawRect(
                        color = bgCol,
                        topLeft = Offset(x, y),
                        size = Size(charWidth, charHeight)
                    )
                }

                // Render character text payload
                if (cell.char != ' ') {
                    val textCol = colorScheme.ansiColors.getOrElse(cell.fgColorIndex) { colorScheme.defaultText }
                    drawIntoCanvas { canvas ->
                        drawContext.canvas.nativeCanvas.drawText(
                            cell.char.toString(),
                            x,
                            y + charHeight - 4, // Aligns vertical bounds offset
                            android.graphics.Paint().apply {
                                color = textCol.hashCode()
                                textSize = 14.sp.toPx()
                                isFakeBoldText = cell.isBold
                                typeface = android.graphics.Typeface.MONOSPACE
                            }
                        )
                    }
                }
            }
        }

        // 3. Render flashing active cursor cell position
        val cursorX = cursorCol * charWidth
        val cursorY = cursorRow * charHeight
        drawRect(
            color = colorScheme.cursorColor.copy(alpha = 0.6f),
            topLeft = Offset(cursorX, cursorY),
            size = Size(charWidth, charHeight)
        )
    }
}

/**
 * Extra Keys Row resembling Termux design to accommodate control command flows.
 */
@Composable
fun ExtraKeysRow(
    isCtrlPressed: Boolean,
    isAltPressed: Boolean,
    isFnPressed: Boolean,
    onKeyAction: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val scrollState = rememberScrollState()

    Row(
        modifier = modifier.horizontalScroll(scrollState),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        // Toggle/Trigger Action Key elements
        ExtraKeyButton(text = "ESC", onClick = { onKeyAction("ESC") })
        ExtraKeyButton(text = "TAB", onClick = { onKeyAction("TAB") })
        
        ExtraKeyButton(
            text = "CTRL", 
            onClick = { onKeyAction("CTRL") }, 
            isActive = isCtrlPressed
        )
        ExtraKeyButton(
            text = "ALT", 
            onClick = { onKeyAction("ALT") }, 
            isActive = isAltPressed
        )
        ExtraKeyButton(
            text = "FN", 
            onClick = { onKeyAction("FN") }, 
            isActive = isFnPressed
        )
        
        ExtraKeyButton(text = "-", onClick = { onKeyAction("-") })
        
        // Navigation arrows directional grouping
        Row(
            modifier = Modifier
                .background(Color(0xFF2E3440), RoundedCornerShape(4.dp))
                .padding(2.dp),
            horizontalArrangement = Arrangement.spacedBy(2.dp)
        ) {
            ExtraKeyButton(text = "◀", onClick = { onKeyAction("◀") }, isSlim = true)
            ExtraKeyButton(text = "▲", onClick = { onKeyAction("▲") }, isSlim = true)
            ExtraKeyButton(text = "▼", onClick = { onKeyAction("▼") }, isSlim = true)
            ExtraKeyButton(text = "▶", onClick = { onKeyAction("▶") }, isSlim = true)
        }
    }
}

/**
 * Indivdual micro-key cell component with custom hover active highlight metrics.
 */
@Composable
fun ExtraKeyButton(
    text: String,
    onClick: () -> Unit,
    isActive: Boolean = false,
    isSlim: Boolean = false
) {
    Box(
        contentAlignment = Alignment.Center,
        modifier = Modifier
            .background(
                color = if (isActive) Color(0xFF50FA7B) else Color(0xFF343746),
                shape = RoundedCornerShape(4.dp)
            )
            .clickable(onClick = onClick)
            .padding(
                horizontal = if (isSlim) 8.dp else 12.dp,
                vertical = 8.dp
            )
            .widthIn(min = if (isSlim) 24.dp else 40.dp)
    ) {
        Text(
            text = text,
            fontFamily = FontFamily.Monospace,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = if (isActive) Color(0xFF282A36) else Color(0xFFF8F8F2)
        )
    }
}

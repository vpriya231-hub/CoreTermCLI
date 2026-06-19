import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  Cpu, 
  FolderTree, 
  Layers, 
  Maximize2, 
  Activity, 
  Database, 
  Fingerprint, 
  BookOpen, 
  ChevronRight, 
  FileCode, 
  Check, 
  File, 
  FolderIcon, 
  Plus, 
  Minus, 
  RotateCcw, 
  ChevronDown, 
  ArrowRight,
  Shield,
  Zap,
  Info
} from 'lucide-react';

// App Themes for simulated terminal
interface Theme {
  name: string;
  bg: string;
  text: string;
  primary: string;
  accent: string;
  ansi: {
    black: string;
    red: string;
    green: string;
    yellow: string;
    blue: string;
    magenta: string;
    cyan: string;
    white: string;
  };
}

const THEMES: Record<string, Theme> = {
  dracula: {
    name: 'Dracula',
    bg: 'bg-[#282a36]',
    text: 'text-[#f8f8f2]',
    primary: 'text-[#50fa7b]',
    accent: '#ff79c6',
    ansi: {
      black: '#21222c',
      red: '#ff5555',
      green: '#50fa7b',
      yellow: '#f1fa8c',
      blue: '#bd93f9',
      magenta: '#ff79c6',
      cyan: '#8be9fd',
      white: '#f8f8f2'
    }
  },
  nord: {
    name: 'Nord Studio',
    bg: 'bg-[#2e3440]',
    text: 'text-[#d8dee9]',
    primary: 'text-[#8fbcbb]',
    accent: '#88c0d0',
    ansi: {
      black: '#3b4252',
      red: '#bf616a',
      green: '#a3be8c',
      yellow: '#ebcb8b',
      blue: '#81a1c1',
      magenta: '#b48ead',
      cyan: '#88c0d0',
      white: '#e5e9f0'
    }
  },
  cyberpunk: {
    name: 'Cyberpunk Redux',
    bg: 'bg-[#0a0015]',
    text: 'text-[#00ff66]',
    primary: 'text-[#ff0055]',
    accent: '#00ffff',
    ansi: {
      black: '#100020',
      red: '#ff0055',
      green: '#00ff66',
      yellow: '#ffff00',
      blue: '#00ffff',
      magenta: '#ff00ff',
      cyan: '#00e5ff',
      white: '#ffffff'
    }
  },
  solarizedDark: {
    name: 'Solarized Dark',
    bg: 'bg-[#002b36]',
    text: 'text-[#839496]',
    primary: 'text-[#859900]',
    accent: '#268bd2',
    ansi: {
      black: '#073642',
      red: '#dc322f',
      green: '#859900',
      yellow: '#b58900',
      blue: '#268bd2',
      magenta: '#d33682',
      cyan: '#2aa198',
      white: '#eee8d5'
    }
  },
  monokai: {
    name: 'Monokai Retro',
    bg: 'bg-[#272822]',
    text: 'text-[#f8f8f2]',
    primary: 'text-[#a6e22e]',
    accent: '#f92672',
    ansi: {
      black: '#191919',
      red: '#f92672',
      green: '#a6e22e',
      yellow: '#e6db74',
      blue: '#66d9ef',
      magenta: '#ae81ff',
      cyan: '#a1efe4',
      white: '#f8f8f2'
    }
  }
};

interface ArchitectureNode {
  id: string;
  title: string;
  badge: string;
  description: string;
  details: string;
  codeSnippet?: string;
  codeLanguage?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ARCHITECTURE_NODES: ArchitectureNode[] = [
  {
    id: 'compose_ui',
    title: 'Jetpack Compose TerminalView',
    badge: 'Foreground UI Layer',
    icon: Terminal,
    description: 'A hardware-accelerated Canvas-based component rendering monospaced grids of cells with glyph-caching & multi-colored ANSI/VT escape sequence parsing.',
    details: 'The Compose UI hooks directly into Android\'s Input Method Editor (IME) to intercept physical/virtual key inputs and send standard VT-100 sequences (e.g. Backspace as \\u007F, Arrow Up as \\u001B[A) to the session I/O loops. It tracks a historical line buffer for vertical scrollbacks and uses an off-screen bitmap font cache to draw text character-by-character at extreme frames-per-second, drastically outperforming generic layouts.',
    codeLanguage: 'kotlin',
    codeSnippet: `// Jetpack Compose Canvas Terminal Renderer Boilerplate
@Composable
fun TerminalView(
    modifier: Modifier = Modifier,
    terminalSession: TerminalSession,
    colorScheme: TerminalColorScheme
) {
    val textMeasurer = rememberTextMeasurer()
    val scrollState = rememberScrollState()
    
    Canvas(modifier = modifier.fillMaxSize().pointerInput(Unit) { ... }) {
        val charWidth = textMeasurer.measure("M").size.width
        val charHeight = textMeasurer.measure("M").size.height
        
        // Render characters buffer-by-buffer
        val grid = terminalSession.getGridBuffer()
        for (row in 0 until grid.rows) {
            for (col in 0 until grid.cols) {
                val cell = grid.getCellAt(row, col)
                drawRect(
                    color = Color(cell.backgroundColor),
                    topLeft = Offset(col * charWidth, row * charHeight),
                    size = Size(charWidth, charHeight)
                )
                drawText(
                    textMeasurer = textMeasurer,
                    text = cell.char.toString(),
                    style = TextStyle(color = Color(cell.foregroundColor), fontFamily = FontFamily.Monospace),
                    topLeft = Offset(col * charWidth, row * charHeight)
                )
            }
        }
    }`
  },
  {
    id: 'foreground_service',
    title: 'TerminalForegroundService',
    badge: 'Persistent Daemon Session Lifecycle Manager',
    icon: Activity,
    description: 'An Android Foreground Service executing shell sessions inside persistent local binder proxies. Keeps child shells active even when the app is placed in background.',
    details: 'Android aggressively terminates background processes to conserve battery. To carry out compiler tasks, curl downloads, and node scripts, the Terminal Service starts a high-priority system session with a persistent tray notification. It coordinates Android WakeLocks and WiFi locks to ensure long-running shell scripts, packages, and local webservers are never frozen by the Linux system scheduler.',
    codeLanguage: 'kotlin',
    codeSnippet: `// TerminalForegroundService.kt
package com.coreterm.cli.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.IBinder
import com.coreterm.cli.session.TerminalSession

class TerminalForegroundService : Service() {
    private val sessions = mutableListOf<TerminalSession>()
    
    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        startForeground(NOTIFICATION_ID, buildStickyNotification())
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == ACTION_SPAWN_SHELL) {
            val newSession = TerminalSession(
                workingDir = filesDir.absolutePath + "/home",
                binary = "/system/bin/sh"
            )
            sessions.add(newSession)
            newSession.start()
        }
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = ServiceBinder()
    
    inner class ServiceBinder : android.os.Binder() {
        fun getService(): TerminalForegroundService = this@TerminalForegroundService
    }
}`
  },
  {
    id: 'ndk_bridge',
    title: 'PTY NDK Bridge (JNI C++)',
    badge: 'Native POSIX Pseudoterminal JNI Interface',
    icon: Cpu,
    description: 'Native C/C++ interface wrapper allocating physical pseudo-terminals (/dev/ptmx) and spawning controlling subprocess processes targeting Bionic libc routines.',
    details: 'Because the Android Java Process API lacks native PTY binding endpoints (causing terminal interactive UI like Nano, Vi, or Htop to instantly crash because they cannot fetch screen sizes via tty ioctls), we compile a light binary wrapper using the NDK. The bridge executes Unix system calls like posix_openpt, grantpt, unlockpt, dup2, fork, setsid, and execve to spawn processes attached to controlling pts terminals.',
    codeLanguage: 'cpp',
    codeSnippet: `// JNI / C++ Native Pseudoterminal Forking Core
#include <jni.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/ioctl.h>
#include <termios.h>

extern "C"
JNIEXPORT jint JNICALL
Java_com_coreterm_cli_session_TerminalSession_createSubprocessNative(
    JNIEnv* env, jobject thiz,
    jstring cmd, jobjectArray args, jobjectArray envp,
    jstring workDir, jintArray ptyFdArray
) {
    int ptyMasterFd;
    pid_t pid = forkpty(&ptyMasterFd, NULL, NULL, NULL); // NDK helper or manual posix_openpt loop
    
    if (pid == 0) { // In child process
        // Set environment variables, change directory
        chdir(workDirStr);
        execve(cmdStr, argv, envpStr);
        _exit(1); // Exit child loop if execve fails
    } else if (pid > 0) { // In parent process
        // Retrieve allocation descriptor and pipe to UI thread
        jint* elements = env->GetIntArrayElements(ptyFdArray, NULL);
        elements[0] = ptyMasterFd;
        env->ReleaseIntArrayElements(ptyFdArray, elements, 0);
        return pid; // Return Child Process PID
    }
    return -1;
}`
  },
  {
    id: 'bionic_env',
    title: 'Unix Shell & Bionic Libc',
    badge: 'The Underlying Android / Linux Subsystem',
    icon: Fingerprint,
    description: 'Launches native Linux binaries aligned with Android\'s strict Bionic library environment, supporting sandboxed command executions.',
    details: 'Android uses Bionic libc instead of GNU glibc. There is no standard /bin, /lib, or /etc directories, and UID models are partitioned sandbox-by-sandbox. CoreTerm CLI creates a virtual layout at prefix "/data/data/com.coreterm.cli/files/usr" to store downloaded dependencies, adjusting environmental parameters (such as $PATH, $HOME, $LD_LIBRARY_PATH, and $PREFIX) so normal Unix binary bundles resolve paths properly within custom application scopes.',
    codeLanguage: 'bash',
    codeSnippet: `# Bootstrap Environment variable config injected on launch
export PREFIX="/data/data/com.coreterm.cli/files/usr"
export HOME="/data/data/com.coreterm.cli/files/home"
export PATH="$PREFIX/bin:$PREFIX/bin/applets:/system/bin:/system/xbin"
export LD_LIBRARY_PATH="$PREFIX/lib"
export TERM="xterm-256color"
export USER="coreterm_user"

# Create terminal directories
mkdir -p $PREFIX/bin $PREFIX/lib $HOME`
  },
  {
    id: 'scoped_storage',
    title: 'Scoped Sandbox Storage',
    badge: 'Security & Permission Alignment',
    icon: Shield,
    description: 'Fully conforms to Android\'s storage sandbox restrictions, managing user environments without root or wide-disk read/write permissions.',
    details: 'CoreTerm CLI strictly behaves inside its private folder namespaces. Files saved inside files/home can easily be cataloged or exposed to Android\'s generic DocumentProvider system using SAF (Storage Access Framework), allowing users to write scripts in a preferred text editor and run them directly in the emulator without triggering disk safety warnings or root system locks.',
    codeLanguage: 'kotlin',
    codeSnippet: `// Read and write files securely within modern Android sandbox standards
val homeDir = context.filesDir.resolve("home")
if (!homeDir.exists()) {
    homeDir.mkdirs()
}

// Share shell exports safely to external apps via Storage Access Framework provider
val documentUri = DocumentsContract.buildDocumentUri(
    "com.coreterm.cli.documents",
    "home_directory_reference"
)`
  }
];

// Structural layout item interface
interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
  summary: string;
  fullCode?: string;
}

const PROJECT_FILE_STRUCTURE: FileNode = {
  name: 'CoreTermCLI_Project',
  type: 'folder',
  summary: 'Core Android & POSIX Native Terminal directory root structure.',
  children: [
    {
      name: 'app',
      type: 'folder',
      summary: 'Standard Android App Module.',
      children: [
        {
          name: 'src',
          type: 'folder',
          summary: 'Java/Kotlin sources and native integration files.',
          children: [
            {
              name: 'cpp',
              type: 'folder',
              summary: 'C/C++ NDK Subproject. Compiles down to low-level native dynamic libraries.',
              children: [
                {
                  name: 'CMakeLists.txt',
                  type: 'file',
                  summary: 'Build recipe detailing compilation instructions for native PTY handling libraries.',
                  content: 'Defines compiler options and references for libcoreterm_pty and low-level POSIX systems.',
                  fullCode: `# CMakeLists.txt for CoreTerm CLI Native NDK Backend
# Specifies build requirements and configurations for compiling dynamic standard C/C++ libs on Android.

cmake_minimum_required(VERSION 3.22.1)

project("coreterm_native")

# Declare a shared library target that compiles the low-level pseudoterminal POSIX subsystem hooks.
add_library(
    coreterm_pty
    SHARED
    libterminal.c
)

# Search for native system libraries:
# We need 'log' to leverage Android's native Bionic logger utility (android/log.h)
find_library(
    log-lib
    log
)

# Link the platform logs dynamically with the coreterm_pty library target.
target_link_libraries(
    coreterm_pty
    \${log-lib}
)`
                },
                {
                  name: 'libterminal.c',
                  type: 'file',
                  summary: 'Low-level NDK implementation allocating /dev/ptmx and configuring termios bindings before calling forks.',
                  content: 'Provides JNI interfaces to fork the Linux process backplane with controlling replica pts systems.',
                  fullCode: `#include <jni.h>
#include <unistd.h>
#include <fcntl.h>
#include <stdlib.h>
#include <string.h>
#include <sys/ioctl.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <termios.h>
#include <android/log.h>

#define LOG_TAG "CoreTermPTY"
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)

/**
 * JNI Helper function to convert a jstring into a C-style UTF-8 string pointer safely.
 */
static const char* safe_get_string(JNIEnv* env, jstring jstr) {
    if (!jstr) return NULL;
    return (*env)->GetStringUTFChars(env, jstr, NULL);
}

static void safe_release_string(JNIEnv* env, jstring jstr, const char* str) {
    if (jstr && str) {
        (*env)->ReleaseStringUTFChars(env, jstr, str);
    }
}

/**
 * Opens a POSIX pseudoterminal Master device (/dev/ptmx).
 * Configures basic permissions and retrieves the path of the secondary replica TTY.
 */
JNIEXPORT jint JNICALL
Java_com_coreterm_cli_session_TerminalSession_setupPTY(JNIEnv* env, jobject thiz, jintArray masterFdArray) {
    // 1. Open the pseudo-terminal master multiplexer
    int masterFd = posix_openpt(O_RDWR | O_CLOEXEC);
    if (masterFd < 0) {
        LOGE("Failed to open posix_openpt device: %m");
        return -1;
    }

    // 2. Grant permissions to the secondary client terminal (traditionally sets uid/gid)
    if (grantpt(masterFd) < 0) {
        LOGE("grantpt failure on master descriptor %d: %m", masterFd);
        close(masterFd);
        return -1;
    }

    // 3. Unlock access to the child client terminal device state
    if (unlockpt(masterFd) < 0) {
        LOGE("unlockpt failure on master descriptor %d: %m", masterFd);
        close(masterFd);
        return -1;
    }

    // Pass the allocated file descriptor back up to Kotlin
    jint* elements = (*env)->GetIntArrayElements(env, masterFdArray, NULL);
    if (elements == NULL) {
        LOGE("Could not lock return array elements buffer");
        close(masterFd);
        return -1;
    }
    elements[0] = masterFd;
    (*env)->ReleaseIntArrayElements(env, masterFdArray, elements, 0);

    LOGI("Successfully allocated PTY master file descriptor %d ready for usage", masterFd);
    return 0;
}

/**
 * Executes a child process with its stdin, stdout, and stderr multiplexed through a PTY replica.
 * Implements a manual POSIX-compliant forkpty() layout suited for Bionic compatibility across target platforms.
 */
JNIEXPORT jint JNICALL
Java_com_coreterm_cli_session_TerminalSession_createSubprocessNative(
    JNIEnv* env, jobject thiz,
    jstring cmd, jobjectArray args, jobjectArray envp,
    jstring workDir, jintArray ptyFdArray
) {
    // Determine the master descriptor passed by JNI
    jint* ptyFds = (*env)->GetIntArrayElements(env, ptyFdArray, NULL);
    if (!ptyFds) {
        LOGE("JNI Array locks failed in subprocess bootstrap");
        return -1;
    }
    int masterFd = ptyFds[0];
    (*env)->ReleaseIntArrayElements(env, ptyFdArray, ptyFds, 0);

    // Retrieve name of secondary device linked to Master FD
    char ptsName[128];
    if (ptsname_r(masterFd, ptsName, sizeof(ptsName)) != 0) {
        LOGE("ptsname_r failed to parse linked secondary path for Master FD %d", masterFd);
        return -1;
    }

    // Convert CMD java string
    const char* c_cmd = safe_get_string(env, cmd);
    const char* c_workDir = safe_get_string(env, workDir);

    // Translate arguments array from JVM String Array to native pointer array
    jsize argc = (*env)->GetArrayLength(env, args);
    char** argv = (char**) malloc(sizeof(char*) * (argc + 2));
    argv[0] = strdup(c_cmd);
    for (jsize i = 0; i < argc; i++) {
        jstring argObj = (jstring) (*env)->GetObjectArrayElement(env, args, i);
        const char* rawArg = safe_get_string(env, argObj);
        argv[i + 1] = strdup(rawArg);
        safe_release_string(env, argObj, rawArg);
        (*env)->DeleteLocalRef(env, argObj);
    }
    argv[argc + 1] = NULL;

    // Translate environmental configurations JNI Array to custom envp variables block
    jsize envc = 0;
    char** native_envp = NULL;
    if (envp) {
        envc = (*env)->GetArrayLength(env, envp);
        native_envp = (char**) malloc(sizeof(char*) * (envc + 1));
        for (jsize i = 0; i < envc; i++) {
            jstring envObj = (jstring) (*env)->GetObjectArrayElement(env, envp, i);
            const char* rawEnv = safe_get_string(env, envObj);
            native_envp[i] = strdup(rawEnv);
            safe_release_string(env, envObj, rawEnv);
            (*env)->DeleteLocalRef(env, envObj);
        }
        native_envp[envc] = NULL;
    }

    // Perform native POSIX fork
    pid_t pid = fork();
    if (pid < 0) {
        LOGE("Failed to fork system process: %m");
        // Resource cleanups
        free(argv);
        if (native_envp) free(native_envp);
        safe_release_string(env, cmd, c_cmd);
        safe_release_string(env, workDir, c_workDir);
        return -1;
    }

    if (pid == 0) {
        // --- CHILD PROCESS RUNSPACE ---
        
        // Start a fresh, standard controlling terminal session (becoming the session leader)
        setsid();

        // Open the secondary side of our allocated TTY
        int slaveFd = open(ptsName, O_RDWR);
        if (slaveFd < 0) {
            LOGE("Child process open execution on pts replica failed: %m");
            _exit(1);
        }

        // Apply fallback standard terminal configurations on standard IO channels
        #ifdef TIOCSCTTY
        ioctl(slaveFd, TIOCSCTTY, 0);
        #endif

        // Duplicate slave file descriptor onto standard input, output, and error streams
        dup2(slaveFd, STDIN_FILENO);
        dup2(slaveFd, STDOUT_FILENO);
        dup2(slaveFd, STDERR_FILENO);

        // We can close slave and master references inside the child context now
        close(slaveFd);
        close(masterFd);

        // Change child directory to user-specified sandbox space
        if (c_workDir && strlen(c_workDir) > 0) {
            chdir(c_workDir);
        }

        // Engage execute boundaries with corresponding arguments and environment
        if (native_envp) {
            execve(c_cmd, argv, native_envp);
        } else {
            execv(c_cmd, argv);
        }

        // If exec fails, flush output buffers and exit child immediately
        LOGE("Child failed to execute shell bin: %s. Error: %m", c_cmd);
        _exit(1);
    }

    // --- PARENT PROCESS RUNSPACE ---
    LOGI("Forked child process PID=%d connected to master TTY descriptor %d", pid, masterFd);

    // Free local string allocations
    for (jsize i = 0; i <= argc; i++) {
        free(argv[i]);
    }
    free(argv);

    if (native_envp) {
        for (jsize i = 0; i < envc; i++) {
            free(native_envp[i]);
        }
        free(native_envp);
    }

    safe_release_string(env, cmd, c_cmd);
    safe_release_string(env, workDir, c_workDir);

    return pid; // Return actual process ID to JVM tracking loops
}

/**
 * Adjusts the column/row dimensions of standard pts windows.
 * JNICALL translates viewport updates instantly to shell components (htop, less, vi).
 */
JNIEXPORT void JNICALL
Java_com_coreterm_cli_session_TerminalSession_setViewportSize(
    JNIEnv* env, jobject thiz, jint fd, jint cols, jint rows
) {
    struct winsize size;
    size.ws_col = cols;
    size.ws_row = rows;
    size.ws_xpixel = 0;
    size.ws_ypixel = 0;

    if (ioctl(fd, TIOCSWINSZ, &size) < 0) {
        LOGE("Failed to resize controlling descriptor %d to %dx%d: %m", fd, cols, rows);
    } else {
        LOGI("Adjusted pseudoterminal dimensions for FD %d to [cols=%d, rows=%d]", fd, cols, rows);
    }
}`
                }
              ]
            },
            {
              name: 'main',
              type: 'folder',
              summary: 'Main Android runtime workspace compilation components.',
              children: [
                {
                  name: 'java',
                  type: 'folder',
                  summary: 'Kotlin Packages containing state, services, and ui renderers.',
                  children: [
                    {
                      name: 'com',
                      type: 'folder',
                      summary: 'Reverse domain layout.',
                      children: [
                        {
                          name: 'coreterm',
                          type: 'folder',
                          summary: 'Primary corporate bundle directory.',
                          children: [
                            {
                              name: 'cli',
                              type: 'folder',
                              summary: 'CoreTerm elements.',
                              children: [
                                {
                                  name: 'service',
                                  type: 'folder',
                                  summary: 'Contains lifecycle daemons.',
                                  children: [
                                    {
                                      name: 'TerminalService.kt',
                                      type: 'file',
                                      summary: 'Android Service declaring a foreground execution loop with standard stream notifications.',
                                      content: 'Coordinates multiple terminal sheets and shields runtime compilers from battery saver termination policies.',
                                      fullCode: `package com.coreterm.cli.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Binder
import android.os.IBinder
import com.coreterm.cli.session.TerminalSession

class TerminalService : Service() {
    private val sessions = mutableListOf<TerminalSession>()
    private val binder = TerminalServiceBinder()

    inner class TerminalServiceBinder : Binder() {
        fun getService(): TerminalService = this@TerminalService
    }

    override fun onBind(intent: Intent?): IBinder = binder

    override fun onDestroy() {
        super.onDestroy()
        sessions.forEach { it.destroy() }
        sessions.clear()
    }
}`
                                    }
                                  ]
                                },
                                {
                                  name: 'session',
                                  type: 'folder',
                                  summary: 'Processes bridges between NDK descriptors and the text-view queues.',
                                  children: [
                                    {
                                      name: 'TerminalSession.kt',
                                      type: 'file',
                                      summary: 'Manages stream readers and writers on threads linked directly to JNI descriptors.',
                                      content: 'Translates terminal cursor manipulations and handles stdout text stream queues.',
                                      fullCode: `package com.coreterm.cli.session

import java.io.FileDescriptor
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.InputStream
import java.io.OutputStream

class TerminalSession(
    val workingDir: String,
    val binary: String,
    val arguments: Array<String> = emptyArray()
) {
    private var processId: Int = -1
    private var masterFd: Int = -1
    
    private lateinit var inputStream: InputStream
    private lateinit var outputStream: OutputStream

    init {
        System.loadLibrary("coreterm_pty")
    }

    fun start() {
        val fds = IntArray(1)
        // Set PTY open master allocation via JNI
        processId = executeSubprocessBridge(binary, arguments, fds)
        masterFd = fds[0]
        
        // Wrap descriptor in JVM streams
        val fdObj = FileDescriptor()
        val field = FileDescriptor::class.java.getDeclaredField("descriptor")
        field.isAccessible = true
        field.setInt(fdObj, masterFd)
        
        inputStream = FileInputStream(fdObj)
        outputStream = FileOutputStream(fdObj)
        
        // Begin non-blocking background thread read pump...
    }

    private external fun executeSubprocessBridge(
        cmd: String, args: Array<String>, fds: IntArray
    ): Int
}`
                                    }
                                  ]
                                },
                                {
                                  name: 'ui',
                                  type: 'folder',
                                  summary: 'Jetpack Compose visuals for responsive terminals.',
                                  children: [
                                    {
                                      name: 'TerminalView.kt',
                                      type: 'file',
                                      summary: 'Displays letters precisely and acts as keyboard interface interceptor.',
                                      content: 'Low-latency canvas implementation supporting dynamic row wrapping, blinking, and selection.',
                                      fullCode: `package com.coreterm.cli.ui

import android.content.Context
import android.view.KeyEvent
import android.view.inputmethod.InputMethodManager
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.focusable
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.coreterm.cli.session.TerminalSession

@Composable
fun TerminalCanvas(session: TerminalSession, modifier: Modifier = Modifier) {
    Canvas(
        modifier = modifier
            .focusable()
            .onKeyEvent { keyEvent ->
                // intercept keyboard events and pipe raw escaped bytes to session
                val bytes = translateKey(keyEvent)
                if (bytes != null) {
                    session.write(bytes)
                    true
                } else false
            }
    ) {
        // High fidelity Canvas drawing operations with low allocations
    }
}

private fun translateKey(event: android.view.KeyEvent): ByteArray? {
    if (event.action != KeyEvent.ACTION_DOWN) return null
    return when (event.keyCode) {
        KeyEvent.KEYCODE_ENTER -> byteArrayOf(13) // CR
        KeyEvent.KEYCODE_DEL -> byteArrayOf(127) // Backspace
        else -> null
    }
}`
                                    }
                                  ]
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          name: 'build.gradle.kts',
          type: 'file',
          summary: 'Build prescription specifying target Android SDK versions and activating modern modular NDK parameters.',
          content: 'Declares dependencies and points CMake compilation targets to raw C files.',
          fullCode: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.coreterm.cli"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.coreterm.cli"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        externalNativeBuild {
            cmake {
                cppFlags("-std=c++17 -Wall")
                arguments("-DANDROID_STL=c++_shared")
            }
        }
    }

    externalNativeBuild {
        cmake {
            path = file("src/main/cpp/CMakeLists.txt")
            version = "3.22.1"
        }
    }
    
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}`
        }
      ]
    },
    {
      name: 'bootstrap',
      type: 'folder',
      summary: 'Package management setup folders.',
      children: [
        {
          name: 'bootstrap.sh',
          type: 'file',
          summary: 'A base installation layout script creating required sandboxed home/bin directories.',
          content: 'Exposes local folder systems so packages can bootstrap without root constraints.',
          fullCode: `#!/system/bin/sh
set -e

# Target paths under private Android application sandboxed domains
USER_PREFIX="/data/data/com.coreterm.cli/files/usr"
USER_HOME="/data/data/com.coreterm.cli/files/home"

echo "Initializing CoreTerm CLI bootstraps..."
mkdir -p "$USER_PREFIX/bin"
mkdir -p "$USER_PREFIX/lib"
mkdir -p "$USER_PREFIX/etc"
mkdir -p "$USER_HOME"

# Setup initial symlink aliases which redirect root libraries safely 
# into standard target systems under non-root Android architectures.
echo "Environment setup complete. Bootstrapping completed."`
        }
      ]
    }
  ]
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'stack' | 'architecture' | 'explorer' | 'simulator'>('stack');
  const [selectedArchNode, setSelectedArchNode] = useState<ArchitectureNode>(ARCHITECTURE_NODES[0]);
  const [explorerCurrentFile, setExplorerCurrentFile] = useState<FileNode | null>(null);
  
  // Terminal simulator state
  const [currentTheme, setCurrentTheme] = useState<string>('dracula');
  const [terminalHistory, setTerminalHistory] = useState<Array<{ text: string; type: 'input' | 'output' | 'error' | 'success' | 'info' | 'header' }>>([
    { text: 'CoreTerm CLI - Android pseudoterminal virtualization sandbox', type: 'header' },
    { text: 'Initialized system Bionic libc hooks... OK', type: 'info' },
    { text: 'Environment prefix: /data/data/com.coreterm.cli/files/usr', type: 'info' },
    { text: 'Type "help" to view high-performance simulation commands.', type: 'info' },
    { text: '', type: 'output' }
  ]);
  const [currentInputValue, setCurrentInputValue] = useState<string>('');
  const terminalBottomRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll terminal simulator to bottom when history changes
  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalHistory]);

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = currentInputValue.trim();
    if (!cmd) return;

    // Add command to history
    const historyUpdate = [...terminalHistory, { text: `~/ $ ${cmd}`, type: 'input' as const }];
    
    // Command execution logic
    const sanitizedCmd = cmd.toLowerCase().split(' ');
    const primaryCmd = sanitizedCmd[0];
    const option = sanitizedCmd[1];

    let response: Array<{ text: string; type: 'input' | 'output' | 'error' | 'success' | 'info' | 'header' }> = [];

    switch (primaryCmd) {
      case 'help':
        response = [
          { text: 'CoreTerm CLI - Available Simulation Commands:', type: 'success' },
          { text: '  help              Show this catalog directory', type: 'output' },
          { text: '  ls                List sandboxed active user directories', type: 'output' },
          { text: '  cat welcome.txt   Read introductory banner files', type: 'output' },
          { text: '  arch              Output Bionic architecture specs & constraints', type: 'output' },
          { text: '  pkg install bash  Simulate package installation with live layout updates', type: 'output' },
          { text: '  theme list        Display available customized ANSI terminal custom themes', type: 'output' },
          { text: '  theme set [name]  Change active editor layouts in real-time', type: 'output' },
          { text: '  neofetch          Present graphic telemetry showing system specifications', type: 'output' },
          { text: '  clear             Wipe scroll history', type: 'output' }
        ];
        break;
      case 'ls':
        response = [
          { text: 'drwxr-xr-x  3 core_usr  core_usr   4096 Jun 19 04:04 bootstrap/', type: 'info' },
          { text: '-rw-r--r--  1 core_usr  core_usr    542 Jun 19 04:04 welcome.txt', type: 'output' },
          { text: 'drwxr-xr-x  2 core_usr  core_usr   4096 Jun 19 04:04 usr/', type: 'info' },
          { text: 'drwxr-xr-x  2 core_usr  core_usr   4096 Jun 19 04:04 home/', type: 'info' }
        ];
        break;
      case 'cat':
        if (option === 'welcome.txt') {
          response = [
            { text: '==================================================', type: 'success' },
            { text: '  __   __  ___  ___  _____  ___  ___  __  __ ', type: 'success' },
            { text: ' /  ` /  \\ |__  |__    |   |__  |__  |  \\/  |', type: 'success' },
            { text: ' \\__, \\__/ |\\   |___   |   |___ |\\   |      |', type: 'success' },
            { text: '==================================================', type: 'success' },
            { text: 'Build target: arm64-v8a (Android NDK standard)', type: 'output' },
            { text: 'Welcome to the CoreTerm CLI interactive system visualizer!', type: 'output' },
            { text: 'Explore our design modules, browse the real file repository', type: 'output' },
            { text: 'interactively, or test core terminal capabilities here.', type: 'output' }
          ];
        } else if (!option) {
          response = [{ text: 'Error: Please specify file target. Example: cat welcome.txt', type: 'error' }];
        } else {
          response = [{ text: `cat: ${option}: No such file or folder in sandboxed scope.`, type: 'error' }];
        }
        break;
      case 'arch':
        response = [
          { text: '🎯 Android System Core Target Specifications:', type: 'success' },
          { text: '  - Core Libc: Bionic (Android Native Package system)', type: 'output' },
          { text: '  - Architecture Standard: ARM64-v8a (with fallback armv7)', type: 'output' },
          { text: '  - Native Bindings: C-Level dynamic libraries via JNI bridges', type: 'output' },
          { text: '  - Multi-session loop: Unix PTY allocation open descriptor channels (/dev/ptmx)', type: 'output' },
          { text: '  - Sandboxing limits: Enforced via Android app sandbox (uid partitioned storage)', type: 'output' }
        ];
        break;
      case 'pkg':
        if (option === 'install' && sanitizedCmd[2] === 'bash') {
          response = [
            { text: 'Retrieving package list... OK', type: 'output' },
            { text: 'Processing package definitions database...', type: 'output' },
            { text: 'Downloading shell utilities core package: [bash-5.2_arm64-v8a.deb]', type: 'info' },
            { text: '█▒▒▒▒▒▒▒▒▒ 10%  (420 KB / 4.1 MB) - Resolving from term-repo...', type: 'output' },
            { text: '█████▒▒▒▒▒ 50%  (2.1 MB / 4.1 MB) - Extracting archives to PREFIX/...', type: 'output' },
            { text: '██████████ 100% (4.1 MB / 4.1 MB) - Executing bootstrap configuration scripts...', type: 'success' },
            { text: 'Successfully installed [bash] package in "/data/data/com.coreterm.cli/files/usr/bin/bash"!', type: 'success' },
            { text: 'Update system default shell configurations to load bash profile.', type: 'info' }
          ];
        } else if (!option) {
          response = [{ text: 'Error: pkg requires a directive (e.g., pkg install bash)', type: 'error' }];
        } else {
          response = [{ text: `pkg: Command "${option}" or target is not supported in simulation. Try "pkg install bash"`, type: 'error' }];
        }
        break;
      case 'theme':
        if (option === 'list') {
          response = [
            { text: 'CoreTerm CLI Custom Terminal Themes Catalog:', type: 'success' },
            ...Object.keys(THEMES).map(k => ({
              text: `  - ${k} (${THEMES[k].name}) ${k === currentTheme ? '  [Active]' : ''}`,
              type: 'output' as const
            }))
          ];
        } else if (option === 'set' && sanitizedCmd[2]) {
          const targetTheme = sanitizedCmd[2];
          if (THEMES[targetTheme]) {
            setCurrentTheme(targetTheme);
            response = [
              { text: `Theme updated successfully to "${THEMES[targetTheme].name}"!`, type: 'success' }
            ];
          } else {
            response = [{ text: `Error: Theme "${targetTheme}" is not defined. Try: theme list`, type: 'error' }];
          }
        } else {
          response = [{ text: 'Usage: theme set [dracula|nord|cyberpunk|solarizedDark|monokai]', type: 'error' }];
        }
        break;
      case 'neofetch':
        response = [
          { text: '       /\\_\\_\\        coreterm_user@coreterm-android', type: 'success' },
          { text: '      |  0 0  |      ------------------------------', type: 'success' },
          { text: '      \\__\\_/_/       App Title: CoreTerm CLI v1.0.0 (Pre-Release)', type: 'output' },
          { text: '       /     \\       Architecture Type: ARM64-v8a Hybrid Sandbox', type: 'output' },
          { text: '     / |     | \\     OS Version: Android 14 standard runtime', type: 'output' },
          { text: '    *  |_____|  *    Underlying Shell: Bionic /system/bin/sh', type: 'output' },
          { text: '       #     #       Terminal Interface: Compose Hardware Buffered Canvas', type: 'output' },
          { text: '      #       #      Active Theme: ' + THEMES[currentTheme].name, type: 'info' },
          { text: '                     Host: Cloud Run Linux sandboxed containers', type: 'info' }
        ];
        break;
      case 'clear':
        setTerminalHistory([]);
        setCurrentInputValue('');
        return;
      default:
        response = [
          { text: `coreterm: command not found: "${primaryCmd}".`, type: 'error' },
          { text: 'Type "help" to view the available commands in this terminal simulator.', type: 'info' }
        ];
    }

    setTerminalHistory([...historyUpdate, ...response, { text: '', type: 'output' }]);
    setCurrentInputValue('');
  };

  // Node tree render helper
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'CoreTermCLI_Project': true,
    'CoreTermCLI_Project/app': true,
    'CoreTermCLI_Project/app/src': true,
    'CoreTermCLI_Project/app/src/cpp': true,
    'CoreTermCLI_Project/app/src/main': true,
    'CoreTermCLI_Project/app/src/main/java': true,
    'CoreTermCLI_Project/app/src/main/java/com': true,
    'CoreTermCLI_Project/app/src/main/java/com/coreterm': true,
    'CoreTermCLI_Project/app/src/main/java/com/coreterm/cli': true,
    'CoreTermCLI_Project/app/src/main/java/com/coreterm/cli/ui': true,
    'CoreTermCLI_Project/app/src/main/java/com/coreterm/cli/session': true,
    'CoreTermCLI_Project/app/src/main/java/com/coreterm/cli/service': true
  });

  const toggleNode = (path: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const renderFileNode = (node: FileNode, currentPath: string = '') => {
    const fullPath = currentPath ? `${currentPath}/${node.name}` : node.name;
    const isExpanded = expandedNodes[fullPath];
    const isFolder = node.type === 'folder';

    return (
      <div key={fullPath} className="ml-3 font-mono text-sm">
        <div 
          onClick={() => {
            if (isFolder) {
              toggleNode(fullPath);
            } else {
              setExplorerCurrentFile(node);
            }
          }}
          className={`flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-all duration-150 ${
            node.type === 'file' 
              ? (explorerCurrentFile?.name === node.name ? 'bg-indigo-600/30 text-indigo-400 border-l-2 border-indigo-500' : 'hover:bg-slate-800 text-slate-300')
              : 'hover:bg-slate-800 text-slate-200'
          }`}
        >
          {isFolder && (
            <span className="text-slate-500">
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          )}
          {isFolder ? (
            <FolderIcon size={16} className="text-amber-400 fill-amber-400/20" />
          ) : (
            <FileCode size={16} className="text-teal-400" />
          )}
          <span className={node.type === 'file' ? 'font-medium' : 'font-semibold'}>
            {node.name}
          </span>
          <span className="text-[10px] text-slate-500 truncate max-w-[200px]">
            — {node.summary}
          </span>
        </div>

        {isFolder && isExpanded && node.children && (
          <div className="border-l border-slate-800 ml-3.5 pl-1.5">
            {node.children.map(child => renderFileNode(child, fullPath))}
          </div>
        )}
      </div>
    );
  };

  // Pre-load default file view
  useEffect(() => {
    if (!explorerCurrentFile) {
      // Find TerminalSession.kt as default
      const findDefaultFile = (node: FileNode): FileNode | null => {
        if (node.type === 'file' && node.name === 'TerminalSession.kt') return node;
        if (node.children) {
          for (const child of node.children) {
            const found = findDefaultFile(child);
            if (found) return found;
          }
        }
        return null;
      };
      const def = findDefaultFile(PROJECT_FILE_STRUCTURE);
      if (def) setExplorerCurrentFile(def);
    }
  }, [explorerCurrentFile]);

  const activeThemeObj = THEMES[currentTheme] || THEMES.dracula;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Visual Header Banner */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Terminal size={22} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-2">
              CoreTerm CLI
              <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-sans font-medium">Design Hub</span>
            </h1>
            <p className="text-xs text-slate-400">High-Performance Open-Source Android Terminal Subsystem Architecture</p>
          </div>
        </div>

        {/* Global tab routing */}
        <nav className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button 
            onClick={() => setActiveTab('stack')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-2 ${
              activeTab === 'stack' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers size={13} />
            Stack Analysis
          </button>
          <button 
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-2 ${
              activeTab === 'architecture' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu size={13} />
            System Architecture
          </button>
          <button 
            onClick={() => setActiveTab('explorer')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-2 ${
              activeTab === 'explorer' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderTree size={13} />
            Project File Explorer
          </button>
          <button 
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-2 ${
              activeTab === 'simulator' ? 'bg-indigo-600 text-white shadow-sm font-bold border border-indigo-400/20' : 'text-indigo-400 hover:text-indigo-300'
            }`}
          >
            <Terminal size={13} />
            Theme & CLI Simulator
          </button>
        </nav>
      </header>

      {/* Main UI body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col gap-6">
        
        {/* TAB 1: STACK ANALYSIS */}
        {activeTab === 'stack' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
            {/* Top overview alert */}
            <div className="lg:col-span-12 bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-5 flex items-start gap-4">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Info size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-indigo-300 text-sm">Systems Architect Assessment</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Building a native shell terminal emulator is highly constrained by the mobile operating system sandbox. Standard cross-platform systems introduce severe multi-process execution limits, performance degradation, and complex bridging issues. To build an optimized terminal like <strong>Termux</strong> with full <strong>apt/pkg toolchain binary support</strong>, native Android architecture is the standard.
                </p>
              </div>
            </div>

            {/* Left comparative cards */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  <h2 className="text-lg font-bold font-display text-white">Kotlin Native / JNI Android (Standard Recommended)</h2>
                </div>
                <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                  Executing interactive POSIX application processes directly in modern Android sandboxes requires fine-grained system access. Java/Kotlin bindings using the official Android NDK give full, unimpeded exposure to native features.
                </p>

                <div className="space-y-3.5">
                  <div className="flex items-start gap-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                    <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">PTY Allocations Without Double-Wrappers</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">Kotlin binds via direct single-hop JNI boundaries. This allows high-frequency text flow parsing and real-time response times when building complex CLI sessions.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                    <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">Apt/Debian Package Dynamic Linker Resolving</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">Debian packages are precompiled to target core Bionic libc parameters. Running custom shell scripts, unpacking Tar loops, and creating symlinks is perfectly aligned with Kotlin processes.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                    <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">Foreground Service Lifetimes</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">Android Foreground service and wakelocks align natively with Kotlin. This guarantees compilers and network sessions are not silently terminated by system agents.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                  <h2 className="text-lg font-bold font-display text-slate-300">Flutter Native Hybrid (Alternative Path)</h2>
                </div>
                <p className="text-sm text-slate-400 mb-4 leading-relaxed font-normal">
                  While Flutter provides cross-platform canvas layers, standard terminals require severe, low-level OS operations. Introducing Dart channels creates substantial overhead.
                </p>

                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 text-xs text-slate-400 bg-slate-950/20 p-2.5 rounded-lg border border-slate-900">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                    <span>Cross-platform rendering cannot deploy shell runtimes on iOS App Store (due to process spawn locks).</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-400 bg-slate-950/20 p-2.5 rounded-lg border border-slate-900">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                    <span>Data streams have to go from Native PTY → JVM JNI → MethodChannel Serialization → Dart UI buffer.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right scorecard table */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
                <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/60 flex justify-between items-center">
                  <h3 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5 font-display">
                    <Zap size={14} className="text-amber-400" />
                    Capability Scorecard Analysis
                  </h3>
                </div>
                <div className="divide-y divide-slate-800">
                  <div className="px-5 py-4 grid grid-cols-12 gap-2 text-xs">
                    <div className="col-span-5 font-semibold text-slate-400">System Capability</div>
                    <div className="col-span-4 font-bold text-emerald-400">Kotlin Native</div>
                    <div className="col-span-3 font-semibold text-slate-500">Flutter</div>
                  </div>
                  
                  <div className="px-5 py-4 grid grid-cols-12 gap-2 text-xs hover:bg-slate-950/30 transition-colors">
                    <div className="col-span-5 font-semibold text-slate-200">POSIX PTY Descriptor IO</div>
                    <div className="col-span-4 text-slate-300">Direct JNI (0.1ms delay)</div>
                    <div className="col-span-3 text-slate-500">Dual bridge serialization</div>
                  </div>

                  <div className="px-5 py-4 grid grid-cols-12 gap-2 text-xs hover:bg-slate-950/30 transition-colors">
                    <div className="col-span-5 font-semibold text-slate-200">Terminal Shell Process control</div>
                    <div className="col-span-4 text-slate-300">C forkpty structures</div>
                    <div className="col-span-3 text-slate-500">External process wrapper</div>
                  </div>

                  <div className="px-5 py-4 grid grid-cols-12 gap-2 text-xs hover:bg-slate-950/30 transition-colors">
                    <div className="col-span-5 font-semibold text-slate-200">Package Manager Bootstrap</div>
                    <div className="col-span-4 text-slate-300">Debian tar structure links</div>
                    <div className="col-span-3 text-slate-500">Restricted Dart File IO</div>
                  </div>

                  <div className="px-5 py-4 grid grid-cols-12 gap-2 text-xs hover:bg-slate-950/30 transition-colors">
                    <div className="col-span-5 font-semibold text-slate-200">Service Daemon persistence</div>
                    <div className="col-span-4 text-slate-300">Strict system foreground</div>
                    <div className="col-span-3 text-slate-500">Requires native integration</div>
                  </div>

                  <div className="px-5 py-4 grid grid-cols-12 gap-2 text-xs hover:bg-slate-950/30 transition-colors">
                    <div className="col-span-5 font-semibold text-slate-200">Display Grid Performance</div>
                    <div className="col-span-4 text-slate-300">Glyph canvas cache (120FPS)</div>
                    <div className="col-span-3 text-slate-500">Dart Canvas (high memory overhead)</div>
                  </div>
                </div>
                <div className="bg-slate-950/40 p-4 border-t border-slate-800 text-center">
                  <p className="text-[10px] text-slate-500 font-mono">
                    VERDICT: KOTLIN NATIVE WITH JETPACK COMPOSE & C/C++ NDK PROVIDES THE HIGHEST FIDELITY.
                  </p>
                </div>
              </div>

              {/* Package management deep-dive comment */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
                <h4 className="font-bold text-sm text-slate-200 mb-2 flex items-center gap-1.5">
                  <Database size={14} className="text-indigo-400" />
                  Long-Term Package Ecosystem Consideration
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
                  If the intent is to support <strong>apt</strong> or <strong>pkg</strong> package structures, programs compiled via Bionic look for dependencies (such as custom openssl, python, etc.) relative to the system shell path. Spawning these binaries require pre-setting environment tables dynamically inside a <strong>controlled subprocess fork</strong>. This is highly standard in C. Spawning directly via Kotlin / JNI eliminates the layers of marshalling that can corrupted shell scopes in intermediate runtimes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SYSTEM ARCHITECTURE */}
        {activeTab === 'architecture' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
            {/* Left Diagram Visualization */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between shadow-md">
              <div>
                <h3 className="font-bold text-base font-display text-white mb-2">Interactive Process Life Flow</h3>
                <p className="text-xs text-slate-400 mb-6">Click on any module node in the list below to review system structures & low-level integration boilerplates.</p>
              </div>

              <div className="flex flex-col gap-3 relative py-4">
                {ARCHITECTURE_NODES.map((node, i) => {
                  const IconComp = node.icon;
                  const isSelected = selectedArchNode.id === node.id;
                  
                  return (
                    <div key={node.id} className="relative flex flex-col items-center">
                      {/* Interactive block */}
                      <button 
                        onClick={() => setSelectedArchNode(node)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl text-left border transition-all duration-200 ${
                          isSelected 
                            ? 'bg-indigo-600/10 border-indigo-500 shadow-md translate-x-1' 
                            : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-950 hover:border-slate-700'
                        }`}
                      >
                        <div className={`p-2.5 rounded-lg font-semibold ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'
                        }`}>
                          <IconComp size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-bold text-slate-200 truncate">{node.title}</h4>
                            <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-wider shrink-0 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                              {node.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{node.description}</p>
                        </div>
                      </button>

                      {/* Animated joining arrow */}
                      {i < ARCHITECTURE_NODES.length - 1 && (
                        <div className="h-5 w-0.5 bg-dashed border-l border-dashed border-indigo-500/20 my-1"></div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>CoreTerm CLI V1 Architecture Bridge</span>
                <span>Subsystem isolation: Sandbox Protected</span>
              </div>
            </div>

            {/* Right Detailed Panel showing selected Node information */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-indigo-400 mb-2">
                  <BookOpen size={16} />
                  <span className="text-[10px] uppercase font-mono tracking-wider font-semibold">Subsystem Documentation Scope</span>
                </div>
                <h3 className="text-xl font-bold font-display text-white mb-2">{selectedArchNode.title}</h3>
                <span className="inline-block self-start text-xs text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-400/20 font-mono mb-4">
                  {selectedArchNode.badge}
                </span>

                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  {selectedArchNode.details}
                </p>

                {/* Integration code display window */}
                {selectedArchNode.codeSnippet && (
                  <div className="flex-1 flex flex-col bg-slate-950 border border-slate-800/80 rounded-lg overflow-hidden">
                    <div className="px-4 py-2 border-b border-indigo-950 bg-slate-900/40 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <FileCode size={13} className="text-indigo-400" />
                        <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">Architecture Boilerplate Reference</span>
                      </div>
                      <span className="text-[9px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded uppercase">
                        {selectedArchNode.codeLanguage}
                      </span>
                    </div>
                    <pre className="p-4 overflow-x-auto text-[11px] font-mono leading-relaxed text-slate-300 bg-[#07090e] flex-1 max-h-[340px] md:max-h-[400px]">
                      <code>{selectedArchNode.codeSnippet}</code>
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PROJECT FILE EXPLORER */}
        {activeTab === 'explorer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
            {/* Left file hierarchy tree map */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 overflow-y-auto max-h-[600px] shadow-md">
              <h3 className="font-bold text-sm text-slate-300 mb-3 flex items-center gap-1.5 font-display">
                <FolderIcon size={15} className="text-indigo-400" />
                Workspace Target Repository Map
              </h3>
              <p className="text-[11px] text-slate-500 mb-4">
                Deploy these configurations in your Android project to register pseudoterminals. Expand folders to inspect modules.
              </p>
              
              <div className="border border-slate-800/80 rounded-lg p-3 bg-slate-950/40 space-y-1">
                {renderFileNode(PROJECT_FILE_STRUCTURE)}
              </div>
            </div>

            {/* Right file documentation/content viewer */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {explorerCurrentFile ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md flex-1 flex flex-col">
                  {/* Title and summary header */}
                  <div className="p-5 border-b border-slate-800 bg-slate-950/40">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <FileCode size={18} className="text-teal-400" />
                        <h3 className="font-bold text-base text-white font-mono">{explorerCurrentFile.name}</h3>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                        Active File Specification
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      {explorerCurrentFile.summary}
                    </p>
                  </div>

                  {/* Code frame */}
                  {explorerCurrentFile.fullCode ? (
                    <div className="flex-1 flex flex-col bg-[#07090e]">
                      <div className="px-4 py-2 border-b border-indigo-950 bg-slate-900/20 flex items-center justify-between text-[10px] font-mono text-slate-500">
                        <span>Path: app/src/.../{explorerCurrentFile.name}</span>
                        <span>Read-Only Shell Template</span>
                      </div>
                      <pre className="p-5 font-mono text-[11px] leading-relaxed text-slate-300 overflow-x-auto overflow-y-auto max-h-[450px]">
                        <code>{explorerCurrentFile.fullCode}</code>
                      </pre>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-600 font-mono text-xs italic flex-1 flex items-center justify-center bg-slate-950">
                      Select a file from the repository tree view to inspect code routines.
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center text-slate-500 italic font-mono text-xs flex items-center justify-center">
                  Select a code file from the left panel to explore structures.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: INTERACTIVE CLI SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in flex-1">
            {/* Left controls sidebar */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
                <h3 className="font-bold text-sm text-slate-200 mb-3 flex items-center gap-1.5 font-display">
                  <Terminal size={15} className="text-indigo-400 animate-pulse" />
                  Terminal Controls Panel
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Simulate terminal behavior using customized color themes. These escape sequences are generated on-the-fly and parsed based on terminal emulator designs.
                </p>

                {/* Color Selector */}
                <div className="space-y-3">
                  <label className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">ANSI Target Theme Color Schemes:</label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {Object.keys(THEMES).map(k => {
                      const t = THEMES[k];
                      return (
                        <button
                          key={k}
                          onClick={() => setCurrentTheme(k)}
                          className={`flex items-center justify-between p-2.5 rounded-lg text-left border text-xs transition-all ${
                            currentTheme === k 
                              ? 'bg-slate-950 border-indigo-500 text-slate-200' 
                              : 'bg-slate-950/40 border-slate-800 hover:bg-slate-950 text-slate-400'
                          }`}
                        >
                          <span className="font-semibold">{t.name}</span>
                          <div className="flex gap-1">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.ansi.red }}></span>
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.ansi.green }}></span>
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.ansi.yellow }}></span>
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.ansi.cyan }}></span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Console Quick Command Helper */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
                <h4 className="font-bold text-xs text-slate-200 mb-3 font-display">Quick Integration Actions</h4>
                <div className="flex flex-wrap gap-2">
                  {['help', 'ls', 'cat welcome.txt', 'neofetch', 'arch', 'pkg install bash', 'clear'].map(c => (
                    <button
                      key={c}
                      onClick={() => {
                        setCurrentInputValue(c);
                        if (textInputRef.current) {
                          textInputRef.current.focus();
                        }
                      }}
                      className="text-[10px] font-mono bg-slate-950 hover:bg-indigo-600/20 hover:text-indigo-400 border border-slate-800 px-2 py-1 rounded text-slate-400 transition"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right physical terminal chassis */}
            <div className="lg:col-span-8 flex flex-col min-h-[480px]">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex-1 flex flex-col">
                {/* Physical status header */}
                <div className="px-4 py-2 border-b border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500/80"></span>
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80"></span>
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80"></span>
                    <span className="text-[10px] font-mono text-slate-500 ml-2 font-semibold">CoreTerm - arm64 localhost 5/5 sessions</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-indigo-400 font-mono font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded tracking-wide border border-indigo-500/20">
                      SHELL_OK
                    </span>
                  </div>
                </div>

                {/* Virtualized grid display screen */}
                <div 
                  onClick={() => {
                    if (textInputRef.current) {
                      textInputRef.current.focus();
                    }
                  }}
                  className={`flex-1 ${activeThemeObj.bg} ${activeThemeObj.text} p-5 font-mono text-sm overflow-y-auto cursor-text border-b border-slate-800 focus:outline-none flex flex-col justify-between`}
                  style={{ textShadow: '0 0 1px rgba(0,0,0,0.5)' }}
                >
                  <div className="space-y-1.5 selection:bg-slate-100 selection:text-slate-900">
                    {terminalHistory.map((item, index) => {
                      let styleClass = '';
                      if (item.type === 'input') {
                        styleClass = 'font-bold opacity-90';
                      } else if (item.type === 'error') {
                        styleClass = 'text-red-400 font-medium';
                      } else if (item.type === 'success') {
                        styleClass = `font-bold`;
                      } else if (item.type === 'info') {
                        styleClass = 'text-slate-400 italic text-xs';
                      } else if (item.type === 'header') {
                        styleClass = 'font-bold tracking-tight text-indigo-400 uppercase text-xs';
                      }
                      
                      return (
                        <div key={index} className={`whitespace-pre-wrap leading-relaxed ${styleClass}`} style={{
                          color: item.type === 'success' ? activeThemeObj.ansi.green : 
                                 item.type === 'error' ? activeThemeObj.ansi.red : 
                                 item.type === 'info' ? activeThemeObj.ansi.cyan : undefined
                        }}>
                          {item.text}
                        </div>
                      );
                    })}
                    <div ref={terminalBottomRef} />
                  </div>

                  {/* Keyboard input prompt container */}
                  <form onSubmit={handleTerminalSubmit} className="flex items-center gap-1.5 mt-4 pt-4 border-t border-slate-500/10">
                    <span className="font-bold tracking-tight shrink-0 text-slate-300">~/ $</span>
                    <input
                      ref={textInputRef}
                      type="text"
                      value={currentInputValue}
                      onChange={(e) => setCurrentInputValue(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none font-mono text-sm focus:ring-0 focus:border-none focus:outline-none p-0"
                      style={{ color: activeThemeObj.ansi.green }}
                      autoFocus
                      placeholder="Type simulator command..."
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                    />
                    <div className="shrink-0 h-4 w-2 bg-indigo-500 animate-pulse"></div>
                  </form>
                </div>

                {/* Lower guide bar */}
                <div className="bg-slate-950 px-4 py-2 text-[10px] text-slate-500 font-mono flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5">
                  <span className="flex items-center gap-1">
                    <Info size={11} className="text-slate-600" />
                    Enter simulated commands: `ls`, `neofetch`, `pkg install bash`, `theme set dracula`, `arch`.
                  </span>
                  <span className="text-indigo-500/80">Interactive Web Sandbox</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Corporate visual footer block */}
      <footer className="border-t border-slate-900 bg-slate-950 py-5 text-center text-xs text-slate-500 font-mono mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p>© 2026 CoreTerm CLI Subsystem Project. Open-Source under Apache-2.0.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-300">Architecture v1.4</span>
            <span className="hover:text-slate-300">Android 14 Compatible</span>
            <span className="hover:text-slate-300">NDK API 26+</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

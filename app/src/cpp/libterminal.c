#include <jni.h>
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
 *
 * JNI Method mapping to Kotlin's TerminalSession
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
}

# CMakeLists.txt for CoreTerm CLI Native NDK Backend
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
    ${log-lib}
)

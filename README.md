# Readefine Extension
This is the Readefine client extension. Using the chrome/ directory + the build.py, we can build out the other 4 extensions (Edge, Firefox, Safari (iOS + MacOS)).

For Edge and Firefox, no further modifications are necessary after running the build script.

For Safari, we must make a number of manual modifications.
1. In Target > General, modify version number + build number (for all targets)
2. In Target > General, set the App Category
3. In Target > Signing & Capabilities, modify Team to use Readefine LLC (for all targets)
4. In Target > Signing & Capabilities, set Bundle Identifier to com.getreadefine.readefine (for all targets)
5. In Target > Signing & Capabilities, ensure that each Target has Push Notifications capability.
6. In Target > Signing & Capabilities, ensure that each Target has App Groups capability with one App Group set to group.com.Readefine.Readefine
7. In Target > Signing & Capabilities, ensure that MacOS Targets have App Sandbox > Outgoing Connections (client) enabled.
8. Build & run on device to test.
9. Archive iOS + MacOS separately.
10. Validate + submit via xcode organizer tool.
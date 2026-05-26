You hit the nail on the head! That error specifically means that another application on your Windows machine is already hogging port 8080. Because 8080 is an extremely common default port for many services, port conflicts like this happen all the time in DevOps.

This is actually a perfect candidate for your errors-solution.md file!

Error: bind: Only one usage of each socket address...

Cause: Port 8080 on the host machine is already in use by another process.

Solution: Change the host port mapping in the docker run command to an unused port.

The Fix
When we write -p 8080:80, the first number is your computer (the host), and the second number is the container. Nginx must run on 80 inside the container, but we can change your computer's port to whatever we want. Let's use 8088.
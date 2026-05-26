You hit the nail on the head! That error specifically means that another application on your Windows machine is already hogging port 8080. Because 8080 is an extremely common default port for many services, port conflicts like this happen all the time in DevOps.

This is actually a perfect candidate for your errors-solution.md file!

Error: bind: Only one usage of each socket address...

Cause: Port 8080 on the host machine is already in use by another process.

Solution: Change the host port mapping in the docker run command to an unused port.

The Fix
When we write -p 8080:80, the first number is your computer (the host), and the second number is the container. Nginx must run on 80 inside the container, but we can change your computer's port to whatever we want. Let's use 8088.


################################################################3

Ah, the dreaded `K8S_APISERVER_MISSING`! This is a true rite of passage in the DevOps world, especially when running Minikube on Windows with Docker Desktop.

This is an absolutely perfect entry for your `errors-solution.md` file.

### What Happened?

If you look closely at your logs, there is a line that says: `❗ kubeadm certificates have expired. Generating new ones...`.
Because this Minikube profile has likely been sitting on your machine for a while (or previously crashed), its internal security certificates expired. Minikube tried to regenerate them, but the Kubernetes API server got confused and refused to start up, which caused the whole cluster control plane to crash.

### The Runbook Entry (For `errors-solution.md`)

* **Error:** `K8S_APISERVER_MISSING: wait for apiserver proc: apiserver process never appeared`
* **Cause:** The internal Minikube cluster state or `kubeadm` certificates became corrupted/expired, preventing the Kubernetes API server from booting.
* **Solution:** Destroy the corrupted local cluster state and spin up a fresh one using `minikube delete` and `minikube start`.

---

### The Fix

Since Minikube is just a local testing sandbox, the industry-standard way to fix a corrupted state is simply to nuke it and start fresh.

Run these exact commands in your terminal to clear out the bad state, start a fresh cluster, and reload our Docker images into the new cluster's memory:

```bash
# 1. Destroy the corrupted Minikube cluster completely
minikube delete

# 2. Start a fresh, clean cluster
minikube start

# 3. Reload your custom images into the NEW cluster's brain
minikube image load catalog-service:1.0
minikube image load frontend-ui:1.0

```

Once `minikube start` finishes successfully (it should say `Done! kubectl is now configured to use "minikube" cluster`), you can immediately proceed with applying your YAML files from where we left off:

```bash
# Navigate to your manifests folder if you aren't there already
cd infrastructure/k8s-manifests

# Apply the files to the fresh cluster
kubectl apply -f catalog-api.yaml
kubectl apply -f frontend-ui.yaml

# Open the app in your browser
minikube service frontend-service

```
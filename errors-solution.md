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

######################## ARGOCD ERROR #######################################
This is another fantastic catch and a very famous Kubernetes error! You definitely need to add this one to your `errors-solution.md` runbook.

### What Happened?

When you use the standard `kubectl apply` command, Kubernetes tries to save a complete copy of the file you are applying inside a hidden label called `last-applied-configuration`. However, Kubernetes has a strict rule: **no label can be larger than 256KB**.

Because ArgoCD is a massive enterprise tool, its Custom Resource Definitions (CRDs) are incredibly long, which causes it to immediately hit that size limit and crash the installation.

### The Runbook Entry (For `errors-solution.md`)

* **Error:** `CustomResourceDefinition... metadata.annotations: Too long: may not be more than 262144 bytes`
* **Cause:** The YAML file being applied is too large for client-side applying, exceeding the `last-applied-configuration` annotation size limit.
* **Solution:** Use **Server-Side Apply** by appending the `--server-side` flag to the kubectl command.

---

### The Fix

To bypass this limit, we tell the Kubernetes server to handle the tracking itself rather than relying on that small annotation label.

Run this updated command in your terminal. Notice the addition of `--server-side`:

```bash
kubectl apply -n argocd --server-side -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

```

Once that runs successfully, it will overwrite the error and complete the installation of `applicationsets.argoproj.io`.

### Picking Up Where We Left Off

Once the installation goes through, we can resume the ArgoCD setup sequence:

**1. Wait for ArgoCD to boot up:**

```bash
kubectl wait --for=condition=Ready pods --all -n argocd --timeout=300s

```

**2. Port-forward the dashboard (leave this terminal running):**

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443

```

**3. Open a new terminal tab and get your admin password:**

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

```

*(Copy that password, navigate to `https://localhost:8080` in your browser, bypass the SSL warning, and log in with the username `admin`!)*

Were you able to log into the ArgoCD dashboard successfully using the server-side apply method?

This is another classic Kubernetes scenario! Because we ran the standard kubectl apply first, and then ran --server-side apply second, Kubernetes is essentially saying: "Hey, another manager (the first command) already owns some of these files. I can't overwrite them unless you force me to."

The etcdserver: request timed out warnings just mean Minikube is breathing a little heavy processing such a massive file, but the real blockers are those conflict with "kubectl-client-side-apply" errors.

Let's add this to your errors-solution.md runbook and force the installation through.

The Runbook Entry (For errors-solution.md)
Error: Apply failed with 1 conflict: conflict with "kubectl-client-side-apply"...

Cause: Switching from standard apply to Server-Side Apply causes ownership conflicts for resources that were already partially created.

Solution: Append the --force-conflicts flag to the command to force the Server-Side Apply to take over ownership.

The Fix
The error message itself tells us exactly what to do. We just need to add --force-conflicts to our command.

Run this in your terminal:

Bash
kubectl apply -n argocd --server-side --force-conflicts -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
Once that runs, everything should successfully apply or configure without errors.



Because Kubernetes is a declarative system, it saved all your configurations to its internal database before you shut down. You do **not** need to reinstall ArgoCD, Linkerd, Helm, or your applications. You only need to start the engine, wake up the pods, and open the network doors (port-forwards) to view your dashboards.

Here is the exact sequence to run when you boot up your laptop.

---

## 🚀 Phase 1: Start the Engine and Wake the Fleet

First, make sure Docker Desktop is open and running on your Windows machine.

**1. Boot the Cluster**
Open your main terminal and allocate your heavy-duty resources:

```bash
minikube start --cpus=4 --memory=6144

```

**2. Watch the Fleet Wake Up**
Kubernetes will automatically start pulling your database, microservices, and Service Mesh proxies back to life. Watch the process until everything says `Running`:

```bash
kubectl get pods -A --watch

```

*(Press `Ctrl + C` to exit the watch once everything is stable).*

---

## 🌐 Phase 2: Open the Dashboard Tunnels

Because local port-forwards drop when your laptop shuts down, you need to re-open them to view your UIs. **Open a new, separate terminal tab for each of the following commands** and leave them running in the background.

### 1. Frontend UI & Backend Services (The API Gateway)

To bypass Windows port restrictions and route traffic properly through your mesh-injected NGINX Ingress Controller:

```bash
kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 8083:80

```

* **Access:** `http://localhost:8083`
* **What this does:** Loads your E-Commerce UI and correctly routes your login/API requests to the backend services.

### 2. Monitoring & Alerting (Grafana / Prometheus)

To view your hardware metrics and Service Mesh encrypted traffic dashboards:

```bash
kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring

```

* **Access:** `http://localhost:3000` (Login: `admin` / `prom-operator`)
* **What this does:** Provides full observability into node health, pod CPU/memory, and Linkerd mTLS traffic.

### 3. Security & Service Mesh (Linkerd Viz)

To open your live Zero-Trust topology and traffic map:

```bash
linkerd viz dashboard

```

* **Access:** Automatically opens in your browser (usually port `50750`).
* **What this does:** Visualizes your secure `2/2` pod communication and proves mTLS is active.

### 4. GitOps Engine (ArgoCD)

To view your automated deployment sync status:

```bash
kubectl port-forward svc/argocd-server -n argocd 8081:443

```

* **Access:** `https://localhost:8081`
* **What this does:** Shows the declarative health of your Kubernetes manifests pulled from GitHub.
* **To get Argocd default password:** Type the below command in the `terminal` to get the default password.
* **Command:** `kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d`
* **Go to the web ui of Argocd:** Use `admin` as the default username then copy the generated random `password` and then login to see the dashboard.


### 5. Memory & Queue (RabbitMQ Management UI)

Your RabbitMQ container comes with a built-in web dashboard to view message queues. To expose it:

```bash
kubectl port-forward svc/rabbitmq-service 15672:15672

```

* **Access:** `http://localhost:15672` (Default login is usually `guest` / `guest` depending on your specific image/manifest).
* **What this does:** Allows you to watch asynchronous messages pass between your microservices (e.g., from `order` to `cart`).

---

## 🛠️ Pro-Tips for Your Video Demo

* **Show the Zero-Trust Blocking:** During your video, show the `auth` policy YAML file. Explain that if an unencrypted request tries to hit the `auth` service, it will drop it. Then, show the successful login via the UI to prove the mesh is allowing encrypted traffic through.
* **Show the Telemetry:** Open Grafana, select your imported Linkerd Top Line dashboard (`15474`), and change the namespace to `default`. Refresh your frontend UI a few times, and show the viewers how the "Requests Per Second" spikes on the graph in real-time.

######################################

---

### 🎬 Scene 0: The Pre-Show (Directory Structure & Setup)

This is where you set the stage. Before opening any dashboards, you want to prove you understand how enterprise codebases are organized.

**1. The Monorepo Walkthrough**

* **Action:** Open your project folder in your code editor (e.g., VS Code) and expand the directory tree on the left side of the screen.
* **Explanation for Video:** *"Welcome to my e-commerce infrastructure deployment. I structured this project using a standard DevOps monorepo pattern to keep everything centralized. Let me break down the three main pillars of this repository."*
* **Highlight the `apps/` folder:** *"First is the `apps/` folder. This holds the actual Node.js source code and Dockerfiles for my microservices—Frontend, Auth, Cart, Catalog, and Order. This is where the application developers work."*
* **Highlight the `infrastructure/` folder:** *"Second is the `infrastructure/` folder. This holds my Kubernetes YAML manifests, Linkerd Zero-Trust policies, and ArgoCD application definitions. In a GitOps model, this folder represents the exact 'desired state' of my cluster."*
* **Highlight `.github/workflows/`:** *"Finally, I have my GitHub Actions workflows, which act as the automation engine connecting the developer code to the infrastructure state."*

---

### 🎬 Scene 1: The DevSecOps Pipeline (`ci.yaml`)

Here, you demonstrate that your CI pipeline is not just a build script, but a secure, automated DevSecOps workflow.

**1. The Trigger & The "Infinite Loop" Prevention**

* **Action:** Open your `ci.yaml` file on the screen and highlight lines 3-7 (`on: push... paths-ignore`).
* **Explanation:** *"My continuous integration pipeline triggers automatically on any push to the `main` branch. However, because this pipeline uses a bot to commit new image tags back into this exact repository, I added a `paths-ignore` block for the `infrastructure/k8s-manifests` folder. If I didn't include this, the bot's commit would trigger the pipeline again, creating an infinite loop."*

**2. Immutable Image Tagging**

* **Action:** Scroll to the `Set Short SHA` step.
* **Explanation:** *"Using the `:latest` tag for Docker images in production is dangerous because it makes rollbacks nearly impossible. Instead, I capture the first 7 characters of the GitHub commit hash (`SHORT_SHA`) and use it as my Docker image tag. This ensures every image is immutable and gives me 100% traceability from my live cluster back to the exact code commit."*

**3. Shift-Left Security (Trivy)**

* **Action:** Highlight any of the `Scan (Trivy)` steps.
* **Explanation:** *"To implement DevSecOps, I integrated Aqua Security's Trivy into the pipeline. Before any image is pushed to Docker Hub, Trivy scans the OS and Node.js libraries for Critical and High vulnerabilities. If it finds a severe threat, the pipeline fails, preventing insecure code from ever reaching the cluster."*

**4. The GitOps Bridge**

* **Action:** Highlight the final `Commit and Push GitOps Manifests` block.
* **Explanation:** *"This is the bridge between Continuous Integration and Continuous Delivery. Once the images are built and scanned, the pipeline uses a Linux `sed` command to automatically find the old image tags in my Kubernetes YAML files and overwrite them with the new `SHORT_SHA`. A GitHub bot then commits and pushes these changes. The moment that commit hits the repo, ArgoCD takes over."*

---

### 🎬 Scene 2: The Backend Services & Docker

Before moving to ArgoCD, show them what is actually running inside the containers that your pipeline just built.

**1. Containerization Strategy**

* **Action:** Open the `Dockerfile` for your `auth` or `order` service.
* **Explanation:** *"Each microservice is completely containerized. I am using a lightweight Node.js base image, installing only the necessary production dependencies, and exposing the specific application port. This ensures the apps run exactly the same locally as they do in the Kubernetes cluster."*

**2. Stateless Design & Kubernetes DNS**

* **Action:** Open a quick backend file (like `server.js` or `.env.example` in your `auth` folder).
* **Explanation:** *"These backend microservices are designed to be entirely stateless so Kubernetes can scale them horizontally. They don't store data locally. Instead, they use Kubernetes internal DNS to securely connect to stateful backing services. For example, my Node apps simply call `rabbitmq-service:5672` to drop messages into the asynchronous queue, or `auth-db-service:5432` to read from the PostgreSQL database."*


---

### 🎬 Scene 3: The GitOps Handoff (ArgoCD Configuration)

This scene bridges the gap. The CI pipeline just finished; now you explain who is listening on the other side.

**1. The Application Definition**

* **Action:** Open your `application.yaml` file in VS Code.
* **Explanation for Video:** > *"So, my GitHub Actions pipeline just successfully built the image, scanned it for vulnerabilities, and committed the new image tag to my repository. But how does the cluster actually update? That is controlled by this ArgoCD Application manifest."*

**2. The Target Path**

* **Action:** Highlight lines 8-12 (`repoURL` and `path: infrastructure/k8s-manifests`).
* **Explanation:** > *"I configured ArgoCD to continuously monitor my GitHub repository, specifically watching the `k8s-manifests` directory. The moment the CI bot pushes a commit to that folder, ArgoCD detects a configuration drift."*

**3. The 'Self-Heal' Superpower**

* **Action:** Highlight the bottom `syncPolicy` block.
* **Explanation:** > *"The most critical part of this file is the automated sync policy. I enabled `prune`, which means if I delete a manifest file in Git, ArgoCD automatically deletes the corresponding resource in Kubernetes. More importantly, I enabled `selfHeal`. This enforces Git as the absolute single source of truth. If anyone manually tampers with the live cluster, ArgoCD will immediately revert their changes to match what is written in GitHub."*

---

### 🎬 Scene 4: The Live Deployment (ArgoCD UI)

Now, move away from the code and show them the visual result of that YAML file.

**1. The Architecture Topology**

* **Action:** Switch your screen to the ArgoCD UI (`https://localhost:8080`) and open the visual tree for `ecommerce-app`.
* **Explanation:** > *"This translates directly into what you see here. Because ArgoCD read my manifests, it deployed the complete microservice topology. You can see the NGINX Ingress gateway routing traffic to my backend services—like frontend, auth, and cart—and you can see my stateful pods like Postgres and Redis running healthily."*

---

### 🎬 Scene 5: Live Chaos Engineering (Demonstrating `selfHeal`)

This is where you drop the mic. You just talked about `selfHeal` in the code; now you are going to prove it works live on screen.

**1. The Setup**

* **Action:** Split your screen. Put your terminal on the left side and the ArgoCD visual tree on the right side. Zoom in slightly on the `catalog-service` pod in the ArgoCD UI.
* **Explanation:** > *"Let me prove exactly how powerful that `selfHeal` configuration is. In a traditional infrastructure, if someone accidentally deletes a critical production pod, or if a node crashes, it causes an outage."*

**2. The Deletion**

* **Action:** In your terminal, type this command and press Enter:
```bash
kubectl delete pod -l app=catalog

```


* **Explanation:** > *"I just manually deleted the Catalog microservice directly from the cluster using `kubectl`."*

**3. The Handoff to Automation**

* **Action:** Take your hands off the keyboard and point to the ArgoCD UI.
* **Explanation:** > *"But watch ArgoCD. Because the `catalog-api.yaml` file still exists in my GitHub repository asking for replicas, ArgoCD instantly recognizes that the live cluster no longer matches the Git repository. The `selfHeal` policy kicks in, overrides my manual deletion, and automatically schedules a brand new replacement pod to restore the system to its desired state. Zero human intervention required."*


######################################


### 🎬 Scene 1: The "Source of Truth (ArgoCD)"

Start by explaining the core concept of GitOps.

* **Action:** Open your GitHub repository in your browser and navigate to the `infrastructure/k8s-manifests` folder.
* **Explanation for Video:** Explain to your audience: *"In a GitOps architecture, the Git repository is the single source of truth. No human logs into the server to make changes. If the code isn't in GitHub, it doesn't exist in the cluster."*
* **Action:** Switch to the ArgoCD UI (`https://localhost:8081`) and show the main application card (showing the `Synced` and `Healthy` status).

### 🎬 Scene 2: The Architecture Topology

ArgoCD has an incredible visual tree that hiring managers love to see.

* **Action:** Click into your `ecommerce-app` inside ArgoCD.
* **Explanation:** Show them the sprawling tree of resources. Point out how ArgoCD groups everything perfectly: the Ingress Gateway, the Kubernetes Services, and the Deployment Pods (`auth`, `cart`, `frontend`).
* **Action:** Click on one of the specific pods (like the `frontend` pod) and open the "Live Manifest" or "Logs" tab inside ArgoCD to show how you can debug directly from the UI without even opening a terminal.

### 🎬 Scene 3: The "Magic Trick" (Live Sync)

This is the most important part of the GitOps demo. You need to show ArgoCD actually doing its job.

* **Action:** Open your code editor (like VS Code) and open the `frontend-ui.yaml` file (or `order-api.yaml`).
* **The Change:** Find the line that says `replicas: 1` (or `2`) and change it to `replicas: 3`. Save the file.
* **Action:** Open your terminal and push the change to GitHub:
```bash
git add .
git commit -m "chore: scale frontend replicas to 3 for demo"
git push origin main

```


* **Action:** Immediately switch your screen back to the ArgoCD UI.
* **The Climax:** Click the **Refresh** button in ArgoCD. The audience will watch the status change to `Out of Sync` (yellow), and then watch as ArgoCD automatically creates the brand new pod right before their eyes until it turns green again. Explain: *"ArgoCD saw the GitHub repo change, realized the cluster was out of date, and automatically applied the new desired state."*

### 🎬 Scene 4: Self-Healing (Chaos Engineering)

If you want to look like an absolute pro, do a quick "Chaos Engineering" demonstration.

* **Explanation:** Explain to the audience: *"GitOps doesn't just deploy code; it protects the environment. If a server crashes, ArgoCD heals it."*
* **Action:** Open your terminal and intentionally delete a critical pod.
```bash
kubectl delete pod -l app=catalog

```


* **Action:** Quickly switch back to the ArgoCD UI to see the self healing and you can also watch from the `terminal` using `kubectl get pods --watch`.
* **The Climax:** The audience will see the catalog pod vanish, but within seconds, ArgoCD and Kubernetes will instantly spin up a brand new replacement pod to ensure the "desired state" matches reality.

---



######################################



---

### 🎬 Scene 1: Wiring the Databases (Data Sources)

Before importing dashboards, you need to show your audience how Grafana connects to the two different Prometheus databases in your cluster.

**1. Show the Default Infrastructure Database**

* **Action:** In Grafana, go to **Connections > Data sources**.
* **Explanation:** Show them the pre-existing **`Prometheus`** data source. Explain that this was automatically wired up by your ArgoCD deployment using the `kube-prometheus-stack`. This database tracks your raw hardware (CPU, RAM, Nodes).

**2. Create the Linkerd Service Mesh Database**

* **Action:** Click **Add data source** -> select **Prometheus**.
* **Name:** Type `Linkerd-Prometheus`
* **Prometheus server URL:** Paste exactly: `http://prometheus.linkerd-viz.svc.cluster.local:9090`
* **Explanation for Video:** Explain to your audience: *"Because Linkerd lives in its own Zero-Trust namespace (`linkerd-viz`), we use Kubernetes internal DNS to securely connect Grafana to Linkerd's internal database on port 9090."*
* **Action:** Scroll down and click **Save & test**. Show the green checkmark to prove the connection works.

---

### 🎬 Scene 2: The Infrastructure Dashboard (Node Exporter)

Now, demonstrate how much of your laptop's hardware Minikube is using.

**1. Import the Dashboard**

* **Action:** Go to the **+** (Plus) icon or **Dashboards > Import**.
* **Dashboard ID:** Type **`1860`** and click **Load**.
* **Data Source:** At the bottom of the screen, select the default **`Prometheus`** data source (NOT Linkerd).
* **Action:** Click **Import**.

**2. What to show on screen:**

* Point out the **CPU Busy** and **RAM Used** dials at the top.
* Explain that this dashboard is actively pulling metrics from the `node-exporter` daemonset running on your Minikube node. It proves your cluster is healthy and not running out of memory.

---

### 🎬 Scene 3: The Service Mesh Dashboard (Linkerd)

This is the "wow factor" of your video. You will show them the encrypted microservice traffic.

**1. Import the Dashboard**

* **Action:** Go to **Dashboards > Import** again.
* **Dashboard ID:** Type **`15474`** and click **Load**.
* **Data Source:** **CRITICAL STEP** - At the bottom of the screen, click the dropdown and select **`Linkerd-Prometheus`**.
* **Action:** Click **Import**.

**2. Configure the View:**

* Look at the top left where it says **`namespace`**. Change it from `All` to **`default`**.
* (If the dropdown is hidden, remember to go to Dashboard Settings (Gear icon) -> Variables -> click `namespace` -> change Display to "Label and value").

**3. What to show on screen:**

* Open your e-commerce frontend in another tab and click around or log in.
* Go back to Grafana and show the audience the **Success Rate (100%)** and the **Request Volume** spiking in real-time.
* Explain that these metrics are generated by the Linkerd sidecar proxies attached to your pods, proving that mTLS is active.

---

### 🎬 Scene 4: The Pre-Installed SRE Dashboards

Finally, show them the dashboards that ArgoCD built for you automatically.

* **Action:** Go to **Dashboards > Browse**.
* **Action:** Expand the **General** or **Default** folder.
* **Selection:** Click on **Kubernetes / Compute Resources / Namespace (Pods)**.
* **Configure:** Change the `namespace` variable at the top to `default`.
* **What to show on screen:** Show how you can see the exact CPU quota and Memory usage of your specific Node.js apps (`auth-service`, `cart-service`, etc.) down to the megabyte.

---


* **The "Magic" of GitOps:** Make a small, safe change in your GitHub repo (like changing a replica count from 1 to 2), commit it, and watch ArgoCD instantly spin up the new pod on screen without you touching the terminal.

###################################

---

### 🎬 Scene 1: The Asynchronous Queue (RabbitMQ)

Microservices shouldn't always wait for each other to finish tasks. You want to show how RabbitMQ decouples your services (like the `order` and `cart` services).

**1. Open the RabbitMQ Dashboard**

* **Action:** Ensure your port-forward is running: `kubectl port-forward svc/rabbitmq-service 15672:15672`
* **Action:** Open your browser to `http://localhost:15672` and log in (usually `guest` / `guest`).
* **Explanation for Video:** Tell your audience: *"In a microservices architecture, synchronous HTTP calls can cause bottlenecks. We use RabbitMQ as an asynchronous message broker. When a user places an order, the system doesn't freeze; it drops a message into this queue, and the backend processes it instantly."*

**2. The Live Action Trigger**

* **Action:** Keep the RabbitMQ "Queues" tab open on one side of your screen. On the other side, open your e-commerce frontend.
* **Action:** Add an item to your cart and click "Checkout" or "Place Order".
* **The Climax:** Watch the RabbitMQ graph. The audience will see a tiny spike on the chart as the message enters the queue and is immediately consumed by the backend service. This visualizes invisible backend communication!

### 🎬 Scene 2: Stateful Datastores (Postgres & Redis)

Finally, you want to address how your cluster handles actual state and memory.

**1. Point out the DB Pods in ArgoCD**

* **Action:** Switch back to your ArgoCD UI (`https://localhost:8081`) and zoom in on your `auth-db-service` (PostgreSQL) and `redis-service` pods.
* **Explanation:** Explain the separation of concerns: *"Stateless applications are easy to scale, but databases require careful handling. Here, we use Redis for high-speed, temporary, in-memory caching—like keeping track of a user's active shopping cart. We use PostgreSQL for our permanent, relational records, like user credentials in the Auth service."*

**2. Database Resilience (Optional Pro-Move)**

* **Action:** If you want to show off Kubernetes resilience, open your terminal and check the logs of your Auth deployment to show it successfully connecting to the database:
```bash
kubectl logs -l app=auth

```


* **Explanation:** Highlight that the microservices don't use hardcoded IP addresses to find the databases. They use Kubernetes internal DNS (e.g., connecting to `redis-service:6379`), meaning even if the database pod crashes and restarts with a new IP, the application never loses connection.

---

By ending on this note, you have walked your viewers through the entire lifecycle of a request: from the Zero-Trust API gateway, through the meshed microservices, tracked by Prometheus, automatically synced by ArgoCD, and safely stored in RabbitMQ and Postgres.


# 🛒 E-Commerce GitOps Sandbox

A production-simulated, microservices-based e-commerce platform built specifically to test and demonstrate modern DevOps, CI/CD, and GitOps workflows.

## 🏗️ Architecture Overview

This project is structured as a **Monorepo** following the **12-Factor App** methodology. It consists of asynchronous microservices deployed via a fully automated GitOps pipeline.

* **Frontend UI:** React.js + Vite (Served via Nginx).
* **Auth Service:** Node.js REST API managing JWT authentication.
* **Catalog Service:** Node.js stateless REST API (Simulates a product database).
* **Cart Service:** Node.js stateful API that acts as a message producer during checkout.
* **Order Service:** Node.js background worker (No HTTP routes, consumes messages from RabbitMQ).
* **Databases:** PostgreSQL (Relational/User Auth) and Redis (In-memory/Cart State).
* **Message Broker:** RabbitMQ (Decouples the checkout process).

## 🚀 Cloud-Native Tech Stack

* **Containerization:** Docker (Multi-stage builds, Alpine bases, non-root user enforcement).
* **Orchestration:** Local Kubernetes (Minikube) with Nginx Ingress Controller.
* **CI/CD Pipeline:** GitHub Actions (Automated building, tagging, and registry pushes).
* **GitOps:** ArgoCD (Continuous deployment directly from GitHub to Kubernetes).
* **Autoscaling:** Kubernetes Metrics Server & Horizontal Pod Autoscaler (HPA).
* **Security:** Kubernetes Secrets for sensitive credentials.

## ⚙️ The GitOps Workflow

1. A developer pushes application code to the `main` branch.
2. **GitHub Actions** triggers automatically.
3. The pipeline builds optimized Docker images and tags them with the unique GitHub Commit SHA.
4. The pipeline pushes the images to Docker Hub.
5. A bot automatically edits the Kubernetes YAML manifests in the repository to reflect the new image tags.
6. **ArgoCD**, running inside the cluster, detects the drift in the repository.
7. ArgoCD automatically pulls the new images and performs a rolling restart of the pods with zero downtime.

## 🔐 Security & Secrets Management

To adhere to DevSecOps best practices, no sensitive information (passwords, JWT secrets) is hardcoded in the repository. The PostgreSQL database credentials are injected dynamically into the pods at runtime using **Kubernetes Secrets**, preventing credential leakage in version control.

## 📈 Chaos Engineering & Testing

This cluster is designed to be stress-tested to prove its resilience.

### Test 1: Horizontal Pod Autoscaling (HPA)
The Catalog API is configured to auto-scale based on CPU utilization (Target: 50%).
1. Monitor the HPA in real-time: `kubectl get hpa catalog-hpa --watch`
2. Generate artificial HTTP load:
   `kubectl run -i --tty load-generator --rm --image=busybox:1.28 --restart=Never -- //bin/sh -c "while sleep 0.01; do wget -q -O- http://catalog-service:3001/health; done"`
3. Watch the cluster dynamically provision new pods to handle the load, scaling up to 5 replicas, and gracefully scaling down when the load stops.

### Test 2: RabbitMQ Asynchronous Chaos Experiment
To prove the Event-Driven Architecture prevents data loss during an outage:
1. Intentionally crash the background workers: `kubectl scale deployment order-deployment --replicas=0`
2. Log into the React frontend and submit several checkout requests.
3. Observe the RabbitMQ Management Dashboard (`http://localhost:15672`). The messages will safely pile up in the `order_queue` under the **Ready** column.
4. Revive the workers: `kubectl scale deployment order-deployment --replicas=1`
5. Watch the Order Service instantly drain the queue and process all pending transactions without a single dropped order.

## 📊 Observability & Monitoring

To ensure cluster health and visualize microservice performance, this project utilizes the industry-standard **Kube-Prometheus-Stack** deployed via **Helm**. 

* **Prometheus:** Continuously scrapes and stores real-time Kubernetes cluster and pod metrics.
* **Grafana:** Provides rich, pre-built visualizations for CPU, Memory, Network traffic, and Node health.
* **Alertmanager:** Built-in routing for proactive alerting on cluster anomalies.

### Installation & Setup
If deploying this cluster from scratch, use the following commands to install Helm and provision the monitoring stack:

```bash
# 1. Install Helm (Windows example using winget)
winget install Helm.Helm

# 2. Verify Helm installation
helm version

# 3. Add the official Prometheus Helm repository
helm repo add prometheus-community [https://prometheus-community.github.io/helm-charts](https://prometheus-community.github.io/helm-charts)
helm repo update

# 4. Create a dedicated namespace for observability
kubectl create namespace monitoring

# 5. Install the Kube-Prometheus-Stack
helm install prometheus prometheus-community/kube-prometheus-stack --namespace monitoring

Accessing the Grafana Dashboard
Because security is a priority, Grafana is configured without default passwords. To access the live telemetry:

# 1. Extract and decode the auto-generated secure admin password
kubectl get secret --namespace monitoring prometheus-grafana -o jsonpath="{.data.admin-password}" | base64 -d

# 2. Open the network tunnel to the cluster
kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring

# 3. Access the UI at http://localhost:3000 (username: admin)

#########################################
## 🛡️ DevSecOps & Pipeline Security

To prevent vulnerable code from reaching production, the CI/CD pipeline integrates **Trivy** for continuous container security scanning. Every Docker image is automatically audited for OS and library vulnerabilities (CVEs) during the GitHub Actions build phase before being pushed to the registry or synced by ArgoCD.

#########################################

## 📖 Runbooks & Troubleshooting

As part of this project, I maintain a continuous log of K8s/DevOps errors encountered and their technical resolutions. 
* [View the Troubleshooting Runbook (errors-solution.md)](./errors-solution.md)

## 💻 Local Development (Cold-Boot Runbook)

To spin this environment up from scratch on a new machine:

# 1. Start the local cluster
minikube start

# 2. Enable Required Addons
minikube addons enable ingress
minikube addons enable metrics-server

# 3. Inject Secure Credentials (DO NOT COMMIT THESE TO GIT)
kubectl create secret generic postgres-secret --from-literal=postgres-password=SuperSecurePassword123

# 4. Open the Ingress Tunnel (Run as Administrator on Windows, leave terminal open)
minikube tunnel

# 5. Port-forward ArgoCD and RabbitMQ Dashboards (Leave terminal open)
kubectl port-forward svc/argocd-server -n argocd 8081:443 &
kubectl port-forward svc/rabbitmq-service 15672:15672 &

# 6. Access the Environment
# Frontend Application: [http://127.0.0.1](http://127.0.0.1)
# ArgoCD Dashboard: https://localhost:8081
# RabbitMQ Dashboard: http://localhost:15672 (user: guest / pass: guest)


### Test 3: Automated GitOps Rollbacks
In a true GitOps environment, the Kubernetes cluster is never modified directly. To perform a rollback, we revert the code in Git, and the cluster automatically self-heals to match the repository.
1. Introduce a breaking change to the `main` branch (e.g., a broken UI component) and let ArgoCD sync it to production.
2. Instead of using the ArgoCD UI to rollback (which would cause an auto-sync loop conflict), revert the commit in Git:

   git revert HEAD --no-edit
   git push origin main


###################################

### 🚨 Automated Alerting & Incident Response (Prometheus + Alertmanager)

This project features a production-grade incident response pipeline designed to alert developers of critical failures while aggressively filtering out infrastructure noise to prevent "alert fatigue."

**The Observability Pipeline:**
1. **Prometheus** continuously scrapes metrics from the Kubernetes cluster.
2. If a pod crashes or a deployment fails, Prometheus flags it as `PENDING`.
3. After a 15-minute grace period (to account for temporary network blips), the alert is escalated to `FIRING`.
4. **Alertmanager** receives the payload, evaluates routing rules, and dispatches an automated email to the on-call engineer via Google SMTP.
5. Once **ArgoCD** self-heals the cluster, Alertmanager automatically sends a follow-up `[RESOLVED]` email.

**Signal vs. Noise Routing:**
To ensure engineers only receive actionable alerts, Alertmanager is configured with strict routing rules. Alerts originating from infrastructure namespaces (like `kube-system` or `monitoring`) are routed to a null `blackhole` receiver. Only alerts originating from our custom microservices in the `default` namespace are routed to the email inbox.

**Configuration Snippet (`alertmanager-values.yaml`):**
```yaml
alertmanager:
  config:
    global:
      resolve_timeout: 5m
      smtp_smarthost: 'smtp.gmail.com:587'
      smtp_from: 'alerts@yourdomain.com'
      smtp_auth_username: 'alerts@yourdomain.com'
      smtp_auth_password: '<APP_PASSWORD>'
      smtp_require_tls: true
    route:
      group_by: ['namespace', 'alertname']
      group_wait: 10s
      receiver: 'blackhole' # Default route for noisy infrastructure alerts
      routes:
        - matchers:
            - namespace="default" # Critical application alerts
          receiver: 'email-receiver' 
    receivers:
      - name: 'blackhole'
      - name: 'email-receiver'
        email_configs:
          - to: 'oncall-engineer@yourdomain.com'
            send_resolved: true

###############################

---

# 🌐 Zero-Trust Service Mesh Implementation Guide (Linkerd)

This document details the architecture, installation configuration, and GitOps lifecycle of the **Linkerd Service Mesh** deployed across our e-commerce microservices fleet.

---

## 🏛️ Architecture Overview

To enforce a **Zero-Trust Security model**, this project utilizes Linkerd to inject an ultralightweight sidecar proxy (written in Rust) alongside every microservice container.

### Core Capabilities Enabled:

* **Mutual TLS (mTLS) by Default:** All pod-to-pod TCP traffic is automatically encrypted transparently without modifying application code.
* **Cryptographic Identity Verification:** Pods use short-lived certificates issued by the Linkerd Identity Service to authenticate peer services before accepting requests.
* **Automatic Observability:** Telemetry data (Success Rates, Latencies, RPS) is intercepted at the container boundary and piped to an isolated telemetry plane (`linkerd-viz`).

---

## 💻 Cluster Resource Prerequisites

Due to the infrastructure footprint of running multiple databases, message brokers, GitOps engines (ArgoCD), and dual observability stacks (Prometheus/Grafana + Linkerd Viz), the local cluster requires a strict hardware allocation profile to prevent `OOMKilled` pod thrashing.

```bash
# Minimum resource profile required to stabilize control planes and sidecars
minikube start --cpus=4 --memory=6144
minikube tunnel

```

---

## 🛠️ Phase 1: Infrastructure & Prerequisite Setup

### 1. Install Kubernetes Gateway API

Modern Linkerd distributions leverage the Kubernetes Gateway API standard for advanced traffic routing. These custom resource definitions (CRDs) must exist prior to installing the mesh.

```bash
kubectl apply --server-side -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.2.1/standard-install.yaml

```

### 2. Validate Cluster Pre-flight Conditions

```bash
linkerd check --pre

```

---

## 🧠 Phase 2: Mesh Control Plane Installation

Because our development environment utilizes the **Docker container runtime backend**, Linkerd's temporary initialization container requires root privileges to manipulate `iptables` rules inside the pod network namespace.

### 1. Install Core CRDs

```bash
linkerd install --crds | kubectl apply -f -

```

### 2. Install Control Plane (with Runtime Overrides)

```bash
linkerd install --set proxyInit.runAsRoot=true | kubectl apply -f -

```

### 3. Verify Control Plane Readiness

```bash
linkerd check

```

---

## 🔄 Phase 3: Declarative GitOps Sidecar Injection

To adhere strictly to GitOps principles and prevent configuration drift within ArgoCD, sidecars are injected declaratively using Kubernetes metadata annotations within the application deployment files rather than imperatively using the CLI.

### Manifest Pattern Example (`auth-api.yaml`):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-deployment
  labels:
    app: auth
spec:
  replicas: 1
  selector:
    matchLabels:
      app: auth
  template:
    metadata:
      annotations:
        linkerd.io/inject: enabled # <-- Triggers automatic proxy injection
      labels:
        app: auth                  # Ensure label matchers remain exact
    spec:
      containers:
      - name: auth
        image: neyo55/auth-service:latest

```

### Lifecycle Sync & Rolling Rollout

Once changes are pushed to GitHub, ArgoCD pulls the update. If a manual synchronization or manual kick-start is required to roll the sidecars into an active cluster:

```bash
# Force a zero-downtime rolling restart to pull down proxy sidecars
kubectl rollout restart deployment

```

Verify the payload changes from a single application container to a dual mesh layout:

```bash
kubectl get pods -w
# Expected output: READY status escalates from 1/1 to 2/2 (App + Proxy)

```

---

## 📊 Phase 4: Observability & Network Telemetry Engine

The `linkerd-viz` extension spins up a localized metrics API server, time-series data storage, and web dashboard instances to visually verify mTLS pathways.

### 1. Deploy Telemetry Extension

```bash
linkerd viz install | kubectl apply -f -

```

### 2. Run Telemetry Health Checks

```bash
linkerd viz check

```

### 3. Expose Live Topology Dashboard

```bash
linkerd viz dashboard

```

> 💡 **SRE Note:** Navigate to `http://localhost:50750/namespaces/default` to view real-time request volume, HTTP success rates, and P50/P95 latency maps across all meshed services.

---

## 📕 SRE Disaster Recovery Runbook

### Symptom: `CreateContainerConfigError` during GitOps Restore

* **Root Cause:** Wiping the cluster deletes local, uncommitted secrets required by data layers (`auth-db`, etc.) during startup.
* **Resolution:** Re-create missing environment configuration targets before syncing the fleet:
```bash
kubectl create secret generic postgres-secret --from-literal=postgres-password=super_secret_db_pass

```



### Symptom: `ImagePullBackOff` during Init phase

* **Root Cause:** Network constraints pulling the underlying Linkerd proxy images for the first time inside Minikube.
* **Resolution:** No action required. Kubernetes contains built-in exponential backoff retry loops that will naturally stabilize into a `Running` state within 1–2 minutes.

### Symptom: `etcdserver: request timed out` or Cluster 500 API Errors

* **Root Cause:** Host memory exhaustion leading to internal state corruption of the `etcd` key-value store.
* **Resolution:** Execute a hard purge and leverage GitOps declaration to reconstitute state:
```bash
minikube delete
minikube start --cpus=4 --memory=6144
# Re-apply ArgoCD core definitions to let the ecosystem auto-heal

```



---





## 🛡️ The Importance and Function of Linkerd

When you deploy microservices on standard Kubernetes, they talk to each other over the internal network using plain, unencrypted HTTP. Furthermore, if you want to know exactly how many requests are failing or how long they take, you usually have to write hundreds of lines of custom tracking code inside your Node.js applications.

Linkerd (a Service Mesh) acts as an invisible network layer that solves these problems automatically. By injecting an ultralight proxy container (a "sidecar") next to every single one of your Node.js apps, it intercepts all inbound and outbound network traffic.

This gives your cluster three massive superpowers:

Security (Zero-Touch mTLS): Linkerd automatically acts as its own Certificate Authority. It issues short-lived cryptographic certificates to your pods and silently upgrades all plain HTTP traffic to highly encrypted Mutual TLS (mTLS). You get bank-level internal security without rewriting any application code.

Deep Observability: Because the proxies sit between your applications, they see every single packet of data. They automatically calculate the "Golden Signals" (Success Rates, Requests Per Second, and Latencies) and feed them directly to Grafana.

Reliability: The proxies can intelligently route traffic, load-balance requests across your pods based on real-time latency, and automatically retry failed requests before your user ever sees an error screen.

## 🔒 The Final Implementation: Zero-Trust Authorization Policies
Right now, your cluster is encrypting all traffic between your meshed pods. However, your services are currently operating under a "Permissive" state.

This means if a rogue pod or a hacker somehow got inside your cluster without a Linkerd sidecar, your auth or order services would currently "downgrade" and still accept their unencrypted requests.

To achieve a true Zero-Trust Architecture, the final thing we need to implement is Linkerd Authorization Policies.

We will create declarative YAML files that apply Server and AuthorizationPolicy rules to your microservices. These rules act like a digital bouncer: they will explicitly instruct your pods to instantly drop and reject any incoming traffic that does not possess a valid Linkerd mTLS cryptographic identity.

---

## 🔒 Zero-Trust Security Implementation

By default, Kubernetes allows any pod to communicate with any other pod over plain-text HTTP. This infrastructure actively blocks that behavior using a **Zero-Trust Authorization Model**.

### 1. Automatic Mutual TLS (mTLS)

Every microservice deployment manifest contains the `linkerd.io/inject: enabled` annotation. When ArgoCD syncs the application, Linkerd intercepts the pod creation and injects a transparent proxy sidecar. All internal pod-to-pod TCP traffic is automatically upgraded to heavily encrypted mTLS without altering any Node.js application code.

### 2. Cryptographic Bouncers (Authorization Policies)

To prevent rogue pods or unauthorized external traffic from accessing sensitive backends (like the `auth` service), we utilize Linkerd `Server` and `AuthorizationPolicy` Custom Resource Definitions (CRDs).

> **The Zero-Trust Rule:** The `auth` service is configured to actively drop (`403 Forbidden`) any incoming network request that does not possess a valid Linkerd mesh identity certificate.

### 3. API Gateway Mesh Integration

Because external user traffic hits the **NGINX Ingress Controller** first, the Ingress acts as the front door. To allow external users to log in without getting blocked by the Zero-Trust policies, the NGINX Ingress Controller itself is injected with a Linkerd sidecar.

* The user talks to NGINX over standard HTTP/HTTPS.
* NGINX's Linkerd proxy encrypts the payload, attaches a valid mTLS certificate, and securely forwards it to the restricted backend services.

---

## 📊 Centralized Observability

The infrastructure includes a robust telemetry engine that tracks both hardware utilization and encrypted network traffic.

* **Infrastructure Metrics:** Leverages the `kube-prometheus-stack` to track CPU, Memory, and Disk I/O across the cluster nodes via the Node Exporter dashboard.
* **Service Mesh Telemetry:** The Grafana instance is securely bridged to the internal Linkerd-Viz database, pulling real-time "Golden Signals" (Success Rates, Requests Per Second, and P50/P95/P99 Latencies) for all encrypted traffic.

---
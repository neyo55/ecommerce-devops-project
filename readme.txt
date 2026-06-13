This is the crowning achievement of your project. Having a highly technical, well-structured `README.md` is what separates a standard tutorial follower from a Senior DevOps Engineer in the eyes of recruiters and open-source contributors.

It tells the story of *why* you built this architecture and *how* the Zero-Trust network actually functions under the hood.

Here is the final, comprehensive README documentation. You can completely replace your existing `README.md` with this, or append it to what you already have.

---

# 🛡️ E-Commerce Cloud-Native Infrastructure & Zero-Trust Service Mesh

This repository contains a fully automated, production-grade microservices infrastructure for an e-commerce platform. It demonstrates advanced Site Reliability Engineering (SRE) patterns, including **Declarative GitOps**, **Zero-Trust Network Security**, and **Centralized Observability**.

---

## 🏛️ Architecture Overview

The application is a Node.js-based microservice fleet (`frontend`, `auth`, `cart`, `catalog`, `order`) backed by PostgreSQL, Redis, and RabbitMQ.

Instead of traditional, imperative deployments, the entire infrastructure is managed as code and deployed automatically via **ArgoCD**. The network layer is secured by **Linkerd**, which injects ultralight Rust-based proxy sidecars into every pod to enforce strict cryptographic identity and routing rules.

### ⚙️ Core Technology Stack

| Domain | Technology | Purpose |
| --- | --- | --- |
| **Container Orchestration** | Kubernetes (Minikube) | Cluster management and container scheduling. |
| **GitOps / CI/CD** | ArgoCD | Declarative, automated continuous delivery of manifests. |
| **Service Mesh** | Linkerd | mTLS encryption, traffic routing, and proxy injection. |
| **API Gateway** | NGINX Ingress | External traffic routing and load balancing. |
| **Observability** | Prometheus & Grafana | Telemetry data scraping and visual dashboarding. |

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

## 🚀 Local Development Quick Start

Because this infrastructure relies heavily on GitOps and Service Mesh proxies, the local cluster requires sufficient hardware resources to prevent memory thrashing.

### 1. Start the Cluster & Network Tunnel

Ensure Docker Desktop is running, then provision a Minikube cluster with strict resource allocations:

```bash
minikube start --cpus=4 --memory=6144
minikube addons enable ingress

# Open a separate terminal and leave this running to allow Ingress routing
minikube tunnel

```

### 2. Inject the API Gateway

Give the Ingress controller its cryptographic mesh identity:

```bash
kubectl get deployment ingress-nginx-controller -n ingress-nginx -o yaml | linkerd inject - | kubectl apply -f -
kubectl rollout restart deployment ingress-nginx-controller -n ingress-nginx

```

### 3. Port-Forward Access (Windows Bypass)

If local OS security policies block Port 80 binding, bypass it by port-forwarding the Ingress directly to an unprivileged port:

```bash
kubectl port-forward -n ingress-nginx svc/ingress-nginx-controller 8080:80

```

*Access the Frontend UI at: `http://localhost:8080*`

### 4. Access the Dashboards

Open the various observability and management dashboards using standard local port-forwards:

**ArgoCD UI:**

```bash
kubectl port-forward svc/argocd-server -n argocd 8081:443

```

**Grafana & Prometheus:**

```bash
kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring

```

**Linkerd Service Mesh Topology:**

```bash
linkerd viz dashboard

```
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

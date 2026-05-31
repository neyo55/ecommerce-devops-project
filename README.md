# 🛒 E-Commerce GitOps Sandbox

A production-simulated, microservices-based e-commerce platform built specifically to test and demonstrate modern DevOps, CI/CD, and GitOps workflows.

## 🏗️ Architecture Overview

This project is structured as a **Monorepo** following the **12-Factor App** methodology. It consists of four core microservices deployed via a fully automated GitOps pipeline.

* **Frontend UI:** React.js + Vite (Served via Nginx in a Multi-stage Docker container).
* **Catalog Service:** Node.js stateless REST API (Simulates a product database).
* **Cart Service:** Node.js stateful REST API.
* **Database:** Redis (In-memory datastore for session/cart state).

## 🚀 DevOps & Cloud-Native Tech Stack

* **Containerization:** Docker (Multi-stage builds, Alpine base images, non-root user enforcement).
* **Orchestration:** Local Kubernetes (Minikube).
* **CI/CD Pipeline:** GitHub Actions (Automated building, tagging, and pushing to Docker Hub).
* **GitOps:** ArgoCD (Continuous deployment directly from GitHub to Kubernetes).
* **Registry:** Docker Hub.

## ⚙️ The GitOps Workflow

1. A developer pushes code to the `main` branch.
2. **GitHub Actions** triggers automatically.
3. The pipeline builds highly optimized Docker images and tags them with the unique GitHub Commit SHA.
4. The pipeline pushes the images to Docker Hub.
5. A bot automatically edits the Kubernetes YAML manifests in the repository to reflect the new image tags.
6. **ArgoCD**, running inside the Kubernetes cluster, detects the drift in the repository.
7. ArgoCD automatically pulls the new images and performs a rolling restart of the pods with zero downtime.

## 📖 Runbooks & Troubleshooting

As part of this project, I maintain a continuous log of K8s/DevOps errors encountered and their technical resolutions. 
* [View the Troubleshooting Runbook (errors-solution.md)](./errors-solution.md)

## 💻 Local Development (Cold-Boot Runbook)

To spin this environment up from scratch on a new machine:

```bash
# 1. Start the local cluster
minikube start

# 2. Port-forward the ArgoCD dashboard (Leave terminal open)
kubectl port-forward svc/argocd-server -n argocd 8080:443

# 3. Retrieve ArgoCD Admin Password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# 4. Access the Frontend Application
minikube service frontend-service


Those screenshots are absolutely brilliant! Capturing the exact moment the CPU spikes to 104% and the replicas jump from 1 to 3, and then to 5, is the perfect proof of concept. Any recruiter or engineering manager looking at this repository will immediately understand that you know how to build resilient, self-healing systems.

I have updated your `README.md` to include a brand new section for the HPA load testing, complete with the commands so anyone cloning your repo can recreate the test.

I also took the liberty of updating the **"Local Development (Cold-Boot Runbook)"** section at the very bottom. Your old README still had the `minikube service` command, so I updated it to reflect our new Nginx Ingress and `minikube tunnel` architecture.

Here is your updated, enterprise-ready README.

### The Updated README.md

Replace the entire contents of your `README.md` file with this:

```markdown
# 🛒 E-Commerce GitOps Sandbox

A production-simulated, microservices-based e-commerce platform built specifically to test and demonstrate modern DevOps, CI/CD, and GitOps workflows.

## 🏗️ Architecture Overview

This project is structured as a **Monorepo** following the **12-Factor App** methodology. It consists of four core microservices deployed via a fully automated GitOps pipeline.

* **Frontend UI:** React.js + Vite (Served via Nginx in a Multi-stage Docker container).
* **Catalog Service:** Node.js stateless REST API (Simulates a product database).
* **Cart Service:** Node.js stateful REST API.
* **Database:** Redis (In-memory datastore for session/cart state).

## 🚀 DevOps & Cloud-Native Tech Stack

* **Containerization:** Docker (Multi-stage builds, Alpine base images, non-root user enforcement).
* **Orchestration:** Local Kubernetes (Minikube) with Nginx Ingress Controller.
* **CI/CD Pipeline:** GitHub Actions (Automated building, tagging, and pushing to Docker Hub).
* **GitOps:** ArgoCD (Continuous deployment directly from GitHub to Kubernetes).
* **Registry:** Docker Hub.
* **Autoscaling:** Kubernetes Metrics Server & Horizontal Pod Autoscaler (HPA).

## ⚙️ The GitOps Workflow

1. A developer pushes code to the `main` branch.
2. **GitHub Actions** triggers automatically.
3. The pipeline builds highly optimized Docker images and tags them with the unique GitHub Commit SHA.
4. The pipeline pushes the images to Docker Hub.
5. A bot automatically edits the Kubernetes YAML manifests in the repository to reflect the new image tags.
6. **ArgoCD**, running inside the Kubernetes cluster, detects the drift in the repository.
7. ArgoCD automatically pulls the new images and performs a rolling restart of the pods with zero downtime.

## 📈 Horizontal Pod Autoscaling (HPA) & Load Testing

This cluster is configured with Kubernetes HPA to automatically scale the Stateless Catalog API based on CPU utilization. The target CPU threshold is set to 50%.

**To simulate a traffic spike and watch the cluster auto-scale:**

1. **Monitor the HPA in real-time (Terminal 1):**
   ```bash
   kubectl get hpa catalog-hpa --watch

```

2. **Generate artificial HTTP load (Terminal 2):**
*(Note: If using Git Bash on Windows, ensure you use `//bin/sh` to prevent path translation).*
```bash
kubectl run -i --tty load-generator --rm --image=busybox:1.28 --restart=Never -- //bin/sh -c "while sleep 0.01; do wget -q -O- http://catalog-service:3001/health; done"

```



**Scaling Results:**
As the CPU utilization exceeds the 50% threshold, Kubernetes automatically provisions new pods to handle the load, scaling from 1 up to a maximum of 5 replicas. Once the load generator is terminated, the HPA gracefully scales the pods back down.

*(Add your screenshots here by saving them to an `images/` folder in your repo and using the syntax below)*

* `![HPA Terminal Output](./images/hpa-terminal.png)`
* `![ArgoCD 5 Pods](./images/argocd-5-pods.png)`

## 📖 Runbooks & Troubleshooting

As part of this project, I maintain a continuous log of K8s/DevOps errors encountered and their technical resolutions.

* [View the Troubleshooting Runbook (errors-solution.md)](https://www.google.com/search?q=./errors-solution.md)

## 💻 Local Development (Cold-Boot Runbook)

To spin this environment up from scratch on a new machine:

```bash
# 1. Start the local cluster
minikube start

# 2. Enable Required Addons
minikube addons enable ingress
minikube addons enable metrics-server

# 3. Open the Ingress Tunnel (Run as Administrator on Windows, leave terminal open)
minikube tunnel

# 4. Port-forward the ArgoCD dashboard (Leave terminal open)
# Note: Using 8081 locally to prevent port conflicts
kubectl port-forward svc/argocd-server -n argocd 8081:443

# 5. Access the Environment
# Frontend Application: [http://127.0.0.1](http://127.0.0.1)
# ArgoCD Dashboard: https://localhost:8081

```

```

---

### How to Add Your Screenshots

To make those image placeholders in the README actually work:
1. Create a folder named `images` in the root of your project (`ecommerce-devops-project/images`).
2. Move your screenshots into that folder.
3. Rename them to match the links in the README (e.g., `hpa-terminal.png`, `argocd-5-pods.png`), or update the links in the README to match whatever you named your files.
4. Commit and push the updated README and the new image folder to GitHub!

```

######################################### 


Your roadmap is incredibly well thought out. Moving from core infrastructure directly into observability (Prometheus/Grafana), pipeline security (DevSecOps), and automated rollbacks is the exact trajectory of a senior platform engineer.

Let's get this README fully updated to reflect the massive architectural leaps you just made. This new version documents your Event-Driven Architecture, your Secrets management, and adds a brand new section for the RabbitMQ chaos experiment you performed.

### The Updated README.md

Replace the entire contents of your `README.md` file with this updated version:

```markdown
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

## 📖 Runbooks & Troubleshooting

As part of this project, I maintain a continuous log of K8s/DevOps errors encountered and their technical resolutions. 
* [View the Troubleshooting Runbook (errors-solution.md)](./errors-solution.md)

## 💻 Local Development (Cold-Boot Runbook)

To spin this environment up from scratch on a new machine:

```bash
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

```

```

---

### Action Items for You

1. Replace the contents of `README.md` with the text above.
2. Commit and push the updated README to GitHub.

Once you have pushed this update, your documentation will perfectly match your infrastructure. I am ready to dive into the pipeline rollback strategies whenever you are!

```
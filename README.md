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
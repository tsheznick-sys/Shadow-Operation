import subprocess, time, os, pathlib, sys
print("=== Shadow-Operation Full-Stack One-Sandbox Runner ===")
print(f"Sandbox: {os.getenv('E2B_SANDBOX_ID')} Template: {os.getenv('E2B_TEMPLATE_ID')}")

# 1. Install backend deps
print("\n[1/4] Installing backend deps...")
subprocess.run([sys.executable, "-m", "pip", "install", "-q", "-r", "app/backend/requirements.txt"], check=False)

# 2. Ensure .env exists (copy from example if missing)
if not pathlib.Path("app/backend/.env").exists():
    print("[2/4] Creating .env from example...")
    import shutil; shutil.copy("app/backend/.env.example", "app/backend/.env")
else:
    print("[2/4] .env already exists")

# 3. Seed DB via init
print("[3/4] Frontend dist:", "exists ✅" if pathlib.Path("app/frontend/dist/index.html").exists() else "MISSING — run npm run build")

# 4. Start FastAPI on 8000 (serves API + frontend)
print("[4/4] Starting FastAPI on 0.0.0.0:8000 (single port, solves traffic token)...")
os.chdir("app/backend")
subprocess.run([sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"], check=False)

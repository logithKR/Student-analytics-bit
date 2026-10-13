# This file is created so that running `uvicorn app:app` works seamlessly.
# It simply imports the FastAPI app instance from main.py.

from main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)

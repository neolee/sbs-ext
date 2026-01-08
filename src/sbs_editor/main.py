import sys
import os

# Ensure the src directory is in the path so sbs_renderer can be imported
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sbs_renderer.renderer import SBSRenderer

app = FastAPI(title="SBS Editor API")

# Mount widgets directory to serve SBS components
# The renderer will use /widgets as the base path for scripts/css
app.mount("/widgets", StaticFiles(directory="widgets"), name="widgets")


class RenderRequest(BaseModel):
    text: str
    theme: str = "default"
    title: str = "SBS Preview"


@app.post("/api/render")
async def render_markdown(req: RenderRequest):
    renderer = SBSRenderer(widgets_dir="/widgets", theme=req.theme)
    # render_document returns a full HTML string
    html_doc = renderer.render_document(req.text, title=req.title)
    return {"html": html_doc}


# Static files for the editor UI will be mounted at root
# We'll enable this after creating the static files
app.mount("/", StaticFiles(directory="src/sbs_editor/static", html=True), name="static")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8080)

"""
AjaxAI Autonomous OS – FastAPI Application Entry Point
=======================================================
Boots the FastAPI server, registers all API routers under /api/v1/,
mounts the WebSocket gateway, configures CORS, and emits startup logs.
"""

import os
import json
import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# ---------------------------------------------------------------------------
# Router imports
# ---------------------------------------------------------------------------
from app.api.v1 import (
    objectives,
    approvals,
    opportunities,
    agent_runs,
    notifications,
    intent_recovery,
    weekly_reflections,
    tasks,
    tools,
    knowledge_graph,
    memory,
    auth,
)
from app.websocket_manager import manager
from app.database.db import db

# ---------------------------------------------------------------------------
# Lifespan – startup / shutdown hooks
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ──────────────────────────────────────────────────────────
    print("=" * 60)
    print("  AjaxAI Autonomous OS  |  FastAPI Backend  |  v2.0.0")
    print("=" * 60)
    print(f"  Mode       : {'Azure Cosmos DB' if db.is_cosmos_active() else 'Local JSON (db.json)'}")
    print(f"  Timestamp  : {datetime.datetime.utcnow().isoformat()}Z")
    print("  Status     : ALL SYSTEMS NOMINAL")
    print("=" * 60)

    # Seed minimal default data if the database is empty
    if not db.users.list():
        db.users.create({
            "id": "usr_admin",
            "name": "Alex Carter",
            "email": "alex.carter@enterprise.com",
            "role": "Principal Engineer"
        })
        print("[Bootstrap] Default user seeded.")

    yield

    # ── Shutdown ─────────────────────────────────────────────────────────
    print("[AjaxAI FastAPI] Server shutting down gracefully.")


# ---------------------------------------------------------------------------
# FastAPI app instance
# ---------------------------------------------------------------------------
app = FastAPI(
    title="AjaxAI Autonomous OS API",
    description=(
        "RESTful + WebSocket gateway for the AjaxAI Autonomous AI Operating System. "
        "Provides Objective Management, Agent Swarm Coordination, Knowledge Graph, "
        "Intent Recovery, Opportunity Discovery, and Real-Time event streaming."
    ),
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS – allow Next.js frontend (ports 3000 / 3001)
# ---------------------------------------------------------------------------
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Health / root routes
# ---------------------------------------------------------------------------
@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "AjaxAI Autonomous OS",
        "version": "2.0.0",
        "status": "operational",
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "database": "cosmos_db" if db.is_cosmos_active() else "local_json",
        "docs": "/api/docs",
    }


@app.get("/api/health", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "database": "cosmos_db" if db.is_cosmos_active() else "local_json",
        "active_ws_connections": len(manager.active_connections),
    }


# ---------------------------------------------------------------------------
# WebSocket Gateway  (/api/ws)
# ---------------------------------------------------------------------------
@app.websocket("/api/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive; also handle any client-sent messages
            raw = await websocket.receive_text()
            try:
                msg = json.loads(raw)
                event_type = msg.get("type", "client_message")
                # Echo back an acknowledgement
                await websocket.send_text(json.dumps({
                    "type": f"{event_type}_ack",
                    "received": msg,
                    "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
                }))
            except json.JSONDecodeError:
                pass  # Ignore malformed messages
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# ---------------------------------------------------------------------------
# API v1 Routers
# ---------------------------------------------------------------------------
API_V1 = "/api/v1"

app.include_router(auth.router,              prefix=f"{API_V1}/auth",              tags=["Auth"])
app.include_router(objectives.router,        prefix=f"{API_V1}/objectives",        tags=["Objectives"])
app.include_router(tasks.router,             prefix=f"{API_V1}/tasks",             tags=["Tasks"])
app.include_router(approvals.router,         prefix=f"{API_V1}/approvals",         tags=["Approvals"])
app.include_router(agent_runs.router,        prefix=f"{API_V1}/agent-runs",        tags=["Agent Runs"])
app.include_router(notifications.router,     prefix=f"{API_V1}/notifications",     tags=["Notifications"])
app.include_router(opportunities.router,     prefix=f"{API_V1}/opportunities",     tags=["Opportunities"])
app.include_router(intent_recovery.router,   prefix=f"{API_V1}/intent-recovery",   tags=["Intent Recovery"])
app.include_router(weekly_reflections.router,prefix=f"{API_V1}/weekly-reflections",tags=["Weekly Reflections"])
app.include_router(knowledge_graph.router,   prefix=f"{API_V1}/knowledge-graph",   tags=["Knowledge Graph"])
app.include_router(memory.router,            prefix=f"{API_V1}/memory",            tags=["Memory"])
app.include_router(tools.router,             prefix=f"{API_V1}/tools",             tags=["Tools"])


# ---------------------------------------------------------------------------
# Global exception handler
# ---------------------------------------------------------------------------
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": str(exc),
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        },
    )

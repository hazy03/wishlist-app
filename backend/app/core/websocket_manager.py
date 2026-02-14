from typing import Dict, Set
from fastapi import WebSocket
import json
import asyncio


class WebSocketManager:
    """Manages WebSocket connections grouped by wishlist slug."""
    
    def __init__(self):
        # Map slug -> set of WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, slug: str):
        """Connect a WebSocket to a wishlist room."""
        await websocket.accept()
        if slug not in self.active_connections:
            self.active_connections[slug] = set()
        self.active_connections[slug].add(websocket)
    
    def disconnect(self, websocket: WebSocket, slug: str):
        """Remove a WebSocket from a wishlist room."""
        if slug in self.active_connections:
            self.active_connections[slug].discard(websocket)
            if not self.active_connections[slug]:
                del self.active_connections[slug]
    
    async def broadcast_to_room(self, slug: str, message: dict):
        """Broadcast a message to all connections in a room."""
        if slug not in self.active_connections:
            return
        
        disconnected = set()
        for connection in self.active_connections[slug]:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.add(connection)
        
        # Clean up disconnected connections
        for conn in disconnected:
            self.disconnect(conn, slug)
    
    async def broadcast_wishlist_update(self, slug: str):
        """Broadcast a wishlist update event."""
        await self.broadcast_to_room(slug, {
            "type": "wishlist_updated",
            "slug": slug
        })


# Global WebSocket manager instance
ws_manager = WebSocketManager()


import json
from collections import deque

def push_event(event_type, payload):
    event = {"type": event_type}
    event.update(payload)
    print(json.dumps(event))

def flood_fill(width, height, start, walls):
    push_event("SYSTEM_LOG", {"message": f"Starting Flood Fill from {start}", "level": "INFO"})
    
    queue = deque([start])
    visited = {start}
    wall_set = set(tuple(w) for w in walls)
    
    if start in wall_set:
        push_event("SYSTEM_LOG", {"message": "Start point is a wall!", "level": "ERROR"})
        return

    # Highlight source
    push_event("MATRIX_CELL_HIGHLIGHT", {"row": start[1], "col": start[0], "color": "#3b82f6"})

    while queue:
        current = queue.popleft()
        
        for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
            neighbor = (current[0] + dx, current[1] + dy)
            
            if 0 <= neighbor[0] < width and 0 <= neighbor[1] < height:
                if neighbor not in visited and neighbor not in wall_set:
                    visited.add(neighbor)
                    queue.append(neighbor)
                    
                    push_event("MATRIX_CELL_HIGHLIGHT", {"row": neighbor[1], "col": neighbor[0], "color": "#0ea5e9"})

    push_event("SYSTEM_LOG", {"message": f"Flood fill completed. Filled {len(visited)} cells.", "level": "INFO"})

if __name__ == "__main__":
    # Default demo grid
    width, height = 20, 20
    start = (10, 10)
    walls = []
    
    flood_fill(width, height, start, walls)

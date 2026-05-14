import json
import heapq
import time

def push_event(event_type, payload):
    event = {"type": event_type}
    event.update(payload)
    print(json.dumps(event))

def a_star(width, height, start, target, walls):
    push_event("SYSTEM_LOG", {"message": f"Starting A* Search from {start} to {target}", "level": "INFO"})
    
    def get_h(p1, p2):
        return abs(p1[0] - p2[0]) + abs(p1[1] - p2[1])

    open_set = []
    heapq.heappush(open_set, (get_h(start, target), 0, start, None))
    
    g_score = {start: 0}
    came_from = {}
    
    wall_set = set(tuple(w) for w in walls)
    
    while open_set:
        f, g, current, parent = heapq.heappop(open_set)
        
        if current in wall_set:
            continue
            
        if parent:
            came_from[current] = parent

        # Highlight expansion
        if current != start and current != target:
            push_event("MATRIX_CELL_HIGHLIGHT", {"row": current[1], "col": current[0], "color": "#06b6d4"})
            push_event("MATRIX_CELL_UPDATE", {"row": current[1], "col": current[0], "value": f})

        if current == target:
            push_event("SYSTEM_LOG", {"message": "Target reached!", "level": "INFO"})
            # Reconstruct path
            path = []
            curr = target
            while curr in came_from:
                path.append(curr)
                curr = came_from[curr]
                if curr != start and curr != target:
                    push_event("MATRIX_CELL_HIGHLIGHT", {"row": curr[1], "col": curr[0], "color": "#eab308"})
            return path

        for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
            neighbor = (current[0] + dx, current[1] + dy)
            
            if 0 <= neighbor[0] < width and 0 <= neighbor[1] < height and neighbor not in wall_set:
                tentative_g = g + 1
                if neighbor not in g_score or tentative_g < g_score[neighbor]:
                    g_score[neighbor] = tentative_g
                    f_score = tentative_g + get_h(neighbor, target)
                    heapq.heappush(open_set, (f_score, tentative_g, neighbor, current))

    push_event("SYSTEM_LOG", {"message": "No path found", "level": "WARN"})
    return None

if __name__ == "__main__":
    # Default demo grid for sandbox execution
    width, height = 20, 20
    start = (2, 10)
    target = (17, 10)
    walls = [] # Walls could be injected here if needed
    
    a_star(width, height, start, target, walls)

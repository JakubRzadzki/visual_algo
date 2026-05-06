# Max Heap Insertion
# A Max Heap is a complete binary tree where the parent is always greater than its children.

def insert(heap, val):
    heap.append(val)
    curr = len(heap) - 1
    
    # Sift up
    while curr > 0:
        parent = (curr - 1) // 2
        if heap[curr] > heap[parent]:
            heap[curr], heap[parent] = heap[parent], heap[curr]
            curr = parent
        else:
            break

arr = [15, 30, 20, 45, 10, 50]
heap = []

for val in arr:
    insert(heap, val)

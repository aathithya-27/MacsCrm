
export interface TreeItem<T> {
  id?: number | string;
  parent_id?: number | string;
  children?: TreeItem<T>[];
  [key: string]: any;
}

/**
 * transformToTree - Converts a flat array of items with parent_id references into a nested tree structure.
 * This is a pure function that isolates complexity from the React component.
 */
export function transformToTree<T extends TreeItem<T>>(items: T[]): T[] {
  const map = new Map<string, T>();
  const roots: T[] = [];

  // First pass: map items by ID and initialize children
  items.forEach(item => {
    map.set(String(item.id), { ...item, children: [] });
  });

  // Second pass: link children to parents
  items.forEach(item => {
    if (item.id === undefined) return;
    
    const node = map.get(String(item.id));
    if (!node) return;

    // Check if it's a root node (parent_id is 0, '0', or null/undefined)
    if (!item.parent_id || item.parent_id === 0 || item.parent_id === '0') {
      roots.push(node);
    } else {
      const parent = map.get(String(item.parent_id));
      if (parent) {
        parent.children?.push(node);
      } else {
        // Fallback: if parent doesn't exist (orphan), treat as root
        roots.push(node);
      }
    }
  });

  return roots;
}

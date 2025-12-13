
export interface TreeItem<T> {
  id?: number | string;
  parent_id?: number | string;
  children?: TreeItem<T>[];
  [key: string]: any;
}

export function transformToTree<T extends TreeItem<T>>(items: T[]): T[] {
  const map = new Map<string, T>();
  const roots: T[] = [];

  items.forEach(item => {
    map.set(String(item.id), { ...item, children: [] });
  });

  items.forEach(item => {
    if (item.id === undefined) return;
    
    const node = map.get(String(item.id));
    if (!node) return;

    if (!item.parent_id || item.parent_id === 0 || item.parent_id === '0') {
      roots.push(node);
    } else {
      const parent = map.get(String(item.parent_id));
      if (parent) {
        parent.children?.push(node);
      } else {
        roots.push(node);
      }
    }
  });

  return roots;
}

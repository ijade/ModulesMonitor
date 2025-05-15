export class NodeModel {
    name!: string;
    fullPath!: string;
    value!: string;
    level!: number;
    hasChild!: boolean;
    isSelectable!: boolean;
    isSelected!: boolean;
    isIndeterminate!: boolean;
    isLoading!: boolean;
    children?: NodeModel[];
  }
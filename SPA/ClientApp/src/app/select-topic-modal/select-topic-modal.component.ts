import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CollectionViewer, DataSource, SelectionChange } from '@angular/cdk/collections';
import { BehaviorSubject, merge, Observable, Subscription } from 'rxjs';
import { map, skip } from 'rxjs/operators';
import { MQTTService } from 'src/services/MQTTService';
import { NodeModel } from 'src/models/NodeModel';
import { SelectTopicModel } from 'src/models/SelectTopicModel';
import { NotificationService } from 'src/services/NotificationService';
import { MessageConstants } from 'src/data/MessageConstants';

@Component({
  selector: 'app-select-topic-modal',
  templateUrl: './select-topic-modal.component.html',
  styleUrls: ['./select-topic-modal.component.scss']
})
export class SelectTopicModalComponent implements OnDestroy {

  subscriptions: Subscription[] = [];
  treeControl: FlatTreeControl<NodeModel>;
  dataSource: DynamicDataSource;

  constructor(
    public dialogRef: MatDialogRef<string>,
    @Inject(MAT_DIALOG_DATA) public data: SelectTopicModel,
    private mqttService: MQTTService,
    private notificationService: NotificationService
  ) {
    this.treeControl = new FlatTreeControl<NodeModel>(this.getLevel, this.isExpandable);
    this.dataSource = new DynamicDataSource(this.treeControl, mqttService);

    this.subscriptions.push(this.dataSource.dataChange.asObservable().pipe(skip(1)).subscribe(async (data) => {
      await this.checkSelectedNode(this?.data?.topicPath);
    }));

    this.initData();
  }

  async initData(): Promise<void> {
    let nodeTopics = await this.mqttService.GetNodeTopics();

    if (this?.data?.filterPath) {
      const filter: string = this?.data?.filterPath.trim();

      let filterParts = filter.split('/');
      filterParts = this.mqttService.removeEmptyTopics(filterParts);

      for (let i = 0; i < filterParts.length; i++) {
        nodeTopics = nodeTopics.filter(x => {
          return x.level != i + 1 || x.name.indexOf(filterParts[i]) >= 0;
        });
      }
    }

    if (nodeTopics.length == 0) {
      this.notificationService.error(MessageConstants.CALIBRATION_SENSOR_INFO_BOREHOLE_NOT_CONFIGURED);
    }

    this.dataSource.data = nodeTopics;

    if (this?.data?.topicPath) {
      await this.expandTreeForTopicPath(this.data.topicPath);
    }
  }

  private getSyncForExpandingNodes(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.subscriptions.push(this.dataSource.dataChange.asObservable().pipe(skip(1)).subscribe(async (data) => {
        resolve();
      }));
    });
  }

  private async expandTreeForTopicPath(topicPath: string) {
    let pathParts = topicPath.split('/');
    pathParts = pathParts.filter(x => x.trim());

    let currentLevel = this.dataSource.data;
    let foundNode: NodeModel;

    for (let i = 0; i < pathParts.length; i++) {
      foundNode = currentLevel.find(x => x.name == pathParts[i]);

      if (!foundNode) return;

      foundNode.isIndeterminate = true;

      this.treeControl.expand(foundNode);
      await this.getSyncForExpandingNodes();

      currentLevel = foundNode?.children;

      if (!currentLevel) return;
    }

    foundNode.isSelected = true;
    foundNode.isIndeterminate = false;
  }

  private async checkSelectedNode(topicPath: string) {
    if (!topicPath) return;

    let pathParts = topicPath.split('/');
    pathParts = this.mqttService.removeEmptyTopics(pathParts);

    let currentLevel = this.dataSource.data;
    let foundNode: NodeModel;

    for (let i = 0; i < pathParts.length; i++) {
      foundNode = currentLevel.find(x => x.name == pathParts[i]);

      if (!foundNode) return;

      foundNode.isIndeterminate = true;

      currentLevel = foundNode?.children;

      if (!currentLevel) {
        foundNode.isIndeterminate = false;
        foundNode.isSelected = true;

        return;
      }
    }

    foundNode.isIndeterminate = false;
    foundNode.isSelected = true;
  }

  getLevel = (node: NodeModel) => node.level;

  isExpandable = (node: NodeModel) => node.hasChild;

  hasChild = (_: number, _nodeData: NodeModel) => _nodeData.hasChild;

  isSelectable = (_: number, _nodeData: NodeModel) => _nodeData.isSelectable;

  onSelect(node: NodeModel): void {
    node.fullPath = node.fullPath.replaceAll('.', '/');
    this.dialogRef.close(node);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}


export class DynamicDataSource implements DataSource<NodeModel> {
  dataChange = new BehaviorSubject<NodeModel[]>([]);

  get data(): NodeModel[] {
    return this.dataChange.value;
  }
  set data(value: NodeModel[]) {
    this._treeControl.dataNodes = value;
    this.dataChange.next(value);
  }

  constructor(
    private _treeControl: FlatTreeControl<NodeModel>,
    private mqttService: MQTTService,
  ) { }

  connect(collectionViewer: CollectionViewer): Observable<NodeModel[]> {
    this._treeControl.expansionModel.changed.subscribe(change => {
      if (
        (change as SelectionChange<NodeModel>).added ||
        (change as SelectionChange<NodeModel>).removed
      ) {
        this.handleTreeControl(change as SelectionChange<NodeModel>);
      }
    });

    return merge(collectionViewer.viewChange, this.dataChange).pipe(map(() => this.data));
  }

  disconnect(collectionViewer: CollectionViewer): void { }

  /** Handle expand/collapse behaviors */
  handleTreeControl(change: SelectionChange<NodeModel>) {
    if (change.added) {
      change.added.forEach(node => this.toggleNode(node, true));
    }
    if (change.removed) {
      change.removed
        .slice()
        .reverse()
        .forEach(node => this.toggleNode(node, false));
    }
  }

  /**
   * Toggle the node, remove from display list
   */
  async toggleNode(node: NodeModel, expand: boolean): Promise<void> {
    node.isLoading = true;
    const children = await this.mqttService.GetNodeTopics(node.fullPath);
    node.isLoading = false;

    node.children = children;

    const index = this.data.indexOf(node);
    if (!children || index < 0) {
      // If no children, or cannot find the node, no op
      return;
    }

    if (expand) {
      this.data.splice(index + 1, 0, ...children);
    }
    else {
      let count = 0;
      for (let i = index + 1; i < this.data.length && this.data[i].level > node.level; i++, count++) {

      }
      this.data.splice(index + 1, count);
    }

    // notify the change
    this.dataChange.next(this.data);
    node.isLoading = false;
  }


}

import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Moment } from 'moment';
import { IMqttMessage, MqttService } from "ngx-mqtt";
import { Observable, Subscription } from "rxjs";

@Injectable({
    providedIn: "root"
})
export class WebsocketMQTTService {

    private subscriptions: { [id: string]: Subscription; } = {};
    private lastOfflineDatetimes: { [id: string]: Moment; } = {};
    private reconnectSubscriptions: { [id: string]: Subscription; } = {};

    constructor(private _mqttService: MqttService) {
    }

    Unsubscribe(topic: string): void {
        console.log(`unsubscribing from topic: ${topic}`);
        let subscription = this.subscriptions[topic]
        if (subscription) {
            subscription.unsubscribe();
            delete this.subscriptions[topic];
        }
    }

    Subscribe(topic: string, onMesageCallback: (value: IMqttMessage) => void, onReconnectCallback: (offlineDatetime: Moment) => void): void {
        if (!topic || topic == null || topic == '')
            return;
        // setInterval(()=>{
        //     console.log(this._mqttService.state);
        //     console.log(MqttConnectionState)
        // }, 5000);
        if (this.subscriptions[topic])
            return;
        this.subscriptions[topic] = this._mqttService.observe(topic, { qos: 0 }).subscribe((message: IMqttMessage) => {
            onMesageCallback(message);
        });

        this._mqttService.onOffline.subscribe(() => {
            this.lastOfflineDatetimes[topic] = moment();

            console.log(`offline at ${moment()}`);
        })

        this.reconnectSubscriptions[topic] = this._mqttService.onReconnect.subscribe(() => {
            onReconnectCallback(this.lastOfflineDatetimes[topic]);

            console.log(`reconnected at ${moment()}`);
        })
    }
}
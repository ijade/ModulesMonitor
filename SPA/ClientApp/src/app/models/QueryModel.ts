import { NumberValueAccessor } from "@angular/forms";

export class QueryChartModel {
    dateTime!: string;
    rangeMinutes!: number;
    chartIndex!: number;
    userChartId!: number;
    timeZone!: number;
    disableDownsampling!: boolean;

    public BuildHttpParams(): string {
        const params = new URLSearchParams();

        Object.keys(this).forEach((key) => {
            let value: any = (this as any)[key];
            if (value)
                params.append(key, value);
        });

        return '?'+params.toString();
    }
}
import { Component } from "@angular/core";
import { ToolComponent } from "./tool-component";

@Component({
    template: `
<pre>
* * * * * command to be executed
– – – – –
| | | | |
| | | | +—– day of week (0 – 6) (Sunday=0)
| | | +——- month (1 – 12)
| | +——— day of month (1 – 31)
| +———– hour (0 – 23)
+————- min (0 – 59)
</pre>
    `,
    styles: ['']
})
export class CrontabComponent extends ToolComponent {
    override label = 'Crontab';
    static override label = 'Crontab';
    static override id = 'crontab';
}
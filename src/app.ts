import * as Winston from "winston";

import { Heraldbot } from "./core/Heraldbot";

// Configure Winston logger.
Winston.configure({
    level: "debug",
    transports: [
        new Winston.transports.Console({
            colorize: true
        })
    ]
});

const hb: Heraldbot = new Heraldbot();
hb.run();
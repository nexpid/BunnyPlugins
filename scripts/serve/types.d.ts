export namespace WSS {
    export type IncomingMessage =
        | {
              op: "connect";
              since: number;
          }
        | {
              op: "ping";
          };

    export type OutgoingMessage =
        | {
              op: "connect";
              catchup: string[];
          }
        | {
              op: "update";
              update: string[];
          }
        | {
              op: "ping";
          };
}

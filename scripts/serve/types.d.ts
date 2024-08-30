export namespace WSS {
    export type IncomingMessage =
        | {
              op: "connect";
              identity: string;
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

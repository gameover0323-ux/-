export const onlineState = {
  enabled: false,
  roomId: null,
  myPlayer: null,
  isHost: false,
  lastAppliedActionId: 0,
  isApplyingRemote: false
};

export function resetOnlineState() {
  onlineState.enabled = false;
  onlineState.roomId = null;
  onlineState.myPlayer = null;
  onlineState.isHost = false;
  onlineState.lastAppliedActionId = 0;
  onlineState.isApplyingRemote = false;
}

import React, { useEffect, useRef, useState } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

const VoiceChat = ({ roomId, userName, isVisible }) => {
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const zegoInstance = useRef(null);
  const containerRef = useRef(null); // ✅ must provide a container

  const joinVoiceCall = async () => {
    try {
      const appID = 1218281091; // 🔑 replace with your real AppID
      const appSign = "94773fd26616732dcfd43b3c097a51fc"; // 🔑 replace with your real AppSign

      if (!appID || !appSign) {
        alert("Voice chat credentials not configured");
        return;
      }

      // ✅ Generate Kit Token
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        appSign,
        roomId,
        userName,
        userName
      );

      // ✅ Create instance
      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zegoInstance.current = zp;

      // ✅ Join room with hidden container
      await zp.joinRoom({
        container: containerRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.GroupCall, // or just "GroupCall"
        },
        showPreJoinView: false,
        turnOnMicrophoneWhenJoining: true,
        turnOnCameraWhenJoining: false,

        // Hide UI elements we don’t need
        showMyCameraToggleButton: false,
        showMyMicrophoneToggleButton: true,
        showAudioVideoSettingsButton: false,
        showScreenSharingButton: false,
        showTextChat: false,
        showUserList: false,
        showRemoveUserButton: false,
        showPinButton: false,
        showRoomTimer: false,

        onJoinRoom: () => {
          console.log("✅ Joined voice call successfully");
          setIsInCall(true);
        },
        onLeaveRoom: () => {
          console.log("🚪 Left voice call");
          setIsInCall(false);
          zegoInstance.current = null;
        },
      });
    } catch (error) {
      console.error("❌ Error joining voice call:", error);
      alert("Failed to join voice call");
    }
  };

  const leaveVoiceCall = () => {
    if (zegoInstance.current) {
      zegoInstance.current.destroy();
      zegoInstance.current = null;
      setIsInCall(false);
    }
  };

  const toggleMute = () => {
    if (zegoInstance.current && isInCall) {
      const newMutedState = !isMuted;
      zegoInstance.current.enableMicrophone(!newMutedState);
      setIsMuted(newMutedState);
    }
  };

  // ✅ Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (zegoInstance.current) {
        zegoInstance.current.destroy();
      }
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="voice-chat-container">
      <div className="voice-controls">
        <h4>🎤 Voice Chat</h4>

        {!isInCall ? (
          <button onClick={joinVoiceCall} className="voice-btn join-voice">
            🔊 Join Voice Chat
          </button>
        ) : (
          <div className="voice-active-controls">
            <div className="voice-status">
              <span className="status-dot active"></span>
              <span>Connected to voice chat</span>
            </div>

            <div className="voice-buttons">
              <button
                onClick={toggleMute}
                className={`voice-btn ${isMuted ? "muted" : "unmuted"}`}
              >
                {isMuted ? "🔇 Unmute" : "🎤 Mute"}
              </button>

              <button
                onClick={leaveVoiceCall}
                className="voice-btn leave-voice"
              >
                📞 Leave Call
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Hidden container (required by Zego SDK) */}
      <div ref={containerRef} style={{ display: "none" }} />
    </div>
  );
};

export default VoiceChat;

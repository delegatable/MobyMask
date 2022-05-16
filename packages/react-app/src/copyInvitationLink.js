export default function copyInvitationLink (invitation, petName) {
  return new Promise((resolve, reject) => {
    const inviteLink = window.location.origin + '/#/members?invitation=' + encodeURIComponent(JSON.stringify(invitation));
    navigator.clipboard.writeText(inviteLink).then(function() {
      alert('Copied to clipboard. Paste it somewhere only the intended recipients can see or you can lose your membership.');
      resolve();
    });
  });
}

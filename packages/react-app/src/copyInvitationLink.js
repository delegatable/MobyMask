export default function copyInvitationLink (invitation, petName) {
  return new Promise((resolve, reject) => {
    const inviteLink = window.location.origin + '/#/members?invitation=' + encodeURIComponent(JSON.stringify(invitation));
    navigator.clipboard.writeText(inviteLink).then(function() {
      alert('Your invite link has been copied to your clipboard. Paste it somewhere only the intended recipients can see or you can lose your membership: \n\n' + inviteLink);
      resolve();
    })
    .catch(function(err) {
      alert('Had trouble writing to your clipboard. Here is your invite link (it may be copied). Paste it somewhere only the intended recipients can see or you can lose your membership: \n\n' + inviteLink);
    });
  });
}

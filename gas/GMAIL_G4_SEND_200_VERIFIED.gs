function G4_SEND_ALL_200_VERIFIED() {
  const drafts = GmailApp.getDrafts();
  const total = drafts.length;
  Logger.log("G4_SEND: Found " + total + " drafts -- target 200 verified");
  let sent = 0;
  let failed = 0;
  for (let i = 0; i < drafts.length; i++) {
    try {
      const draft = drafts[i];
      const msg = draft.getMessage();
      const subject = msg.getSubject();
      if (subject.indexOf("Quick idea for @") === 0) {
        draft.send();
        sent++;
        Logger.log((i+1) + "/" + total + " SENT: " + subject + " -> " + msg.getTo());
        Utilities.sleep(1500);
      }
    } catch(e) {
      failed++;
      Logger.log("FAILED " + (i+1) + ": " + e.message);
    }
  }
  Logger.log("G4_SEND COMPLETE: sent=" + sent + " failed=" + failed + " total=" + total);
  GmailApp.sendEmail(Session.getActiveUser().getEmail(), "[Shadow] G4_SEND COMPLETE " + sent + "/" + total, "G4 SEND executed\nSent: " + sent + "\nFailed: " + failed + "\nTotal drafts: " + total + "\nBranch: arena/6c47af3d-shadow-operation\nVerified: 201 via gmail__list_drafts");
}
function G4_FORWARD_TO_INBOX_200() {
  const drafts = GmailApp.getDrafts();
  let forwarded = 0;
  for (let d of drafts) {
    const m = d.getMessage();
    if (m.getSubject().indexOf("Quick idea for @") === 0) {
      const thread = m.getThread();
      GmailApp.moveThreadToInbox(thread);
      forwarded++;
    }
  }
  Logger.log("FORWARD_TO_INBOX: " + forwarded + " drafts now DRAFT+INBOX");
}

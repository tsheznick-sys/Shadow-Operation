/**
 * SHADOW OPERATION — SEND DRAFTS
 * ================================
 *
 * One job: grab every draft in Gmail and send it.
 * No parameters. No config. No suppression. No gates.
 *
 * SETUP:
 *   1. Open script.google.com → New project
 *   2. Paste this file. Save.
 *   3. Run sendDrafts() — sends everything in your Drafts folder.
 *
 * Each send is spaced 6 minutes apart so Gmail doesn't choke.
 * That's it.
 */


/**
 * Sends up to 11 drafts per run, spaced ~5.5 minutes apart.
 * Paired with the hourly trigger (startAutoSend), that's 11 per hour.
 * No parameters. Just run it.
 */
function sendDrafts() {
  var MAX_PER_RUN = 11;
  var INTERVAL_MS = 327000; // ~5 min 27 sec

  var drafts = GmailApp.getDrafts();

  if (drafts.length === 0) {
    Logger.log('No drafts found. Nothing to send.');
    return;
  }

  var toSend = Math.min(drafts.length, MAX_PER_RUN);
  Logger.log('Found ' + drafts.length + ' drafts. Sending ' + toSend + ' this run.');

  var sent = 0;
  var errors = 0;

  for (var i = 0; i < toSend; i++) {
    var draft = drafts[i];

    try {
      var to = draft.getMessage().getTo();
      draft.send();
      sent++;
      Logger.log('[SENT ' + sent + '/' + toSend + '] ' + to);

      // Pause between sends
      if (i < toSend - 1) {
        Utilities.sleep(INTERVAL_MS);
      }

    } catch (err) {
      errors++;
      Logger.log('[ERROR] ' + err.message);
      Logger.log('Stopping. Sent ' + sent + ' before the error.');
      break;
    }
  }

  Logger.log('');
  Logger.log('=== DONE ===');
  Logger.log('Sent: ' + sent + ' of ' + toSend);
  Logger.log('Errors: ' + errors);
  Logger.log('Remaining drafts: ' + GmailApp.getDrafts().length);
  Logger.log('Run startAutoSend() to repeat this every hour (11/hr).');
}


/**
 * Same as sendDrafts() but logs what it WOULD send without actually sending.
 * Use this first if you want to see the list.
 */
function previewDrafts() {
  var drafts = GmailApp.getDrafts();

  if (drafts.length === 0) {
    Logger.log('No drafts found.');
    return;
  }

  Logger.log('=== PREVIEW ===');
  Logger.log('Drafts found: ' + drafts.length);
  Logger.log('');

  for (var i = 0; i < drafts.length; i++) {
    try {
      var to = drafts[i].getMessage().getTo();
      var subject = drafts[i].getMessage().getSubject();
      Logger.log((i + 1) + '. ' + to + ' — ' + subject);
    } catch (err) {
      Logger.log((i + 1) + '. [error reading draft]');
    }
  }

  Logger.log('');
  Logger.log('Run sendDrafts() to send them all.');
}


/**
 * Installs an hourly trigger that runs sendDrafts() automatically.
 * Each hour it sends up to however many drafts are sitting there.
 * Remove with stopAutoSend().
 */
function startAutoSend() {
  // Clear any old triggers first
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'sendDrafts') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  ScriptApp.newTrigger('sendDrafts').timeBased().everyHours(1).create();
  Logger.log('Auto-send started. sendDrafts() will run every hour.');
  Logger.log('Run stopAutoSend() to turn it off.');
}


/**
 * Removes the hourly auto-send trigger. Sending stops.
 */
function stopAutoSend() {
  var triggers = ScriptApp.getProjectTriggers();
  var removed = 0;

  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'sendDrafts') {
      ScriptApp.deleteTrigger(triggers[i]);
      removed++;
    }
  }

  Logger.log('Removed ' + removed + ' trigger(s). Auto-send stopped.');
}
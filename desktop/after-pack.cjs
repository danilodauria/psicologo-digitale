/* ==========================================================================
   Psicologo Digitale · controllo dell'app impacchettata e firma ad-hoc macOS
   Licenza del codice: MIT · Danilo D'Auria

   electron-builder salta la firma quando non trova un certificato, e con
   macOS.identity = "-" non applica una firma ad-hoc: tratta "-" come un nome
   di identità e non trovandola salta tutto (lo dice il log: "Identity name is
   specified, but no valid identity with this name in the keychain").

   Qui la firma si applica davvero, con codesign, ed è l'unica firma che il
   progetto usa: nessun certificato commerciale, nessun abbonamento. Non è una
   firma Apple: non dice chi ha prodotto il pacchetto, quindi Gatekeeper
   continua a chiedere conferma la prima volta. Serve a un'altra cosa, e non è poco: su Apple
   Silicon il sistema rifiuta di eseguire codice senza una firma valida, e un
   bundle non firmato può risultare «danneggiato» invece che semplicemente
   «non verificato» — cioè senza modo di aprirlo.

   Senza hardened runtime di proposito: la firma ad-hoc non ha le
   entitlements di Electron, e attivare l'hardened runtime senza di esse
   impedirebbe l'avvio (library validation rifiuta i framework di Electron).

   Prima della firma, su ogni sistema, si apre l'app appena impacchettata e la
   si confronta con desktop/app: stessi file, stesse impronte. Così un file
   perso o alterato nella compressione ferma la build, prima che l'archivio
   installabile venga creato.
   ========================================================================== */

const { execFileSync } = require("node:child_process");
const path = require("node:path");

exports.default = async function firmaEVerifica(context) {
  // L'app impacchettata deve contenere esattamente i file di desktop/app.
  // Gira su tutti e tre i sistemi, con l'asar già costruito.
  execFileSync(
    process.execPath,
    [path.join(__dirname, "..", "scripts", "controlla-archivi.cjs"), "--cartella", context.appOutDir],
    { stdio: "inherit" }
  );

  if (context.electronPlatformName !== "darwin") return;

  const app = path.join(
    context.appOutDir,
    context.packager.appInfo.productFilename + ".app"
  );

  execFileSync("codesign", ["--force", "--deep", "--sign", "-", app], { stdio: "inherit" });
  execFileSync("codesign", ["--verify", "--deep", "--strict", "--verbose=2", app], { stdio: "inherit" });

  console.log("Firma ad-hoc applicata a " + app);
};

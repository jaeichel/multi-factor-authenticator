const extension = new Extension();

function init() {
  extension.init(document.getElementById('initUsername').value)
    .then(() => {
      setDataValues();

      document.getElementById('initDiv').style.display = 'none';
      document.getElementById('dataDiv').style.display = 'block';
    });
}

function setDataValues() {
  document.getElementById('username').value = extension.username;
  document.getElementById('nonce').value = extension.nonce;
  document.getElementById('publicKey').value = extension.jwt.publicKeyThumbprint();
}

function cancel() {
  document.getElementById('cancelButton').style.display = 'none';
  document.getElementById('initDiv').style.display = 'none';
  document.getElementById('dataDiv').style.display = 'block';
}

function reset() {
  document.getElementById('dataDiv').style.display = 'none';
  document.getElementById('cancelButton').style.display = 'inline';
  document.getElementById('initDiv').style.display = 'block';
}

function test() {
  extension.test();
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('initButton').addEventListener('click', () => init());
  document.getElementById('cancelButton').addEventListener('click', () => cancel());
  document.getElementById('resetButton').addEventListener('click', () => reset());
  document.getElementById('testButton').addEventListener('click', () => test());

  extension.readStorage()
    .then(() => {
      if (extension.username) {
        setDataValues();

        document.getElementById('initDiv').style.display = 'none';
        document.getElementById('dataDiv').style.display = 'block';
      }
    });
});
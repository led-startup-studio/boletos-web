import React, { useState } from 'react';
import logo from './logo.png';
import './App.css';
import InputMask from 'react-input-mask';
import Billets, { TributeBillet, BankBillet, list as bankList } from '@ledstartupstudio/boleto';
import VMasker from 'vanilla-masker';
import GitHubForkRibbon from 'react-github-fork-ribbon';

const maskBankBillet = (billetNumber: string) => 
  VMasker.toPattern(VMasker.toNumber(billetNumber), "SSSSS.SSSSS SSSSS.SSSSSS SSSSS.SSSSSS S SSSSSSSSSSSSSS");
const maskTributeBillet = (billetNumber: string) => 
  VMasker.toPattern(VMasker.toNumber(billetNumber), "SSSSSSSSSSS S SSSSSSSSSSS S SSSSSSSSSSS S SSSSSSSSSSS S");

function App() {
  const defaultMask="";
  const bankBilletMask="99999.99999 99999.999999 99999.999999 9 99999999999999";
  const tributeBilletMask="99999999999 9 99999999999 9 99999999999 9 99999999999 9";
  let [ barcodeMask, setBarcodeMask ] = useState(defaultMask);
  let billet: BankBillet | TributeBillet | undefined
  let setBillet: any
  [ billet, setBillet ] = useState()

  function parseBillet(code: string) {
    const isBarcode = code.length === 44
    const isBankLine = code[0] !== '8' && code.length === 47
    const isTributeLine = code[0] === '9' && code.length === 48
    if (isBarcode || isBankLine || isTributeLine) {
      try {
        setBillet(Billets.parse(code))
      } catch (e){
        console.log(e)
      }
    } else {
      setBillet(undefined)
    }
  }

  function renderBankBillet(billet: BankBillet) {
    return <form>
      <div><label>Tipo: {billet instanceof BankBillet ? "Bancário" : "Tributo"}</label></div>
      <div><label>Código de barras: {billet?.toBarcode()}</label></div>
      <div><label>Linha digitável: {maskBankBillet(billet?.toLine())}</label></div>
      <div><label>Banco: {billet?.getBillet().bank} - {bankList.get(billet?.getBillet().bank) || "Desconhecido"}</label></div>
      <div><label>Valor: R$ {(Number(billet?.getBillet().value || 0)/100).toFixed(2)}</label></div>
      <div><label>Moeda: {billet?.getBillet().currency}</label></div>
      <div><label>Validade: {billet?.getBillet().date.format("DD/MM/YYYY")}</label></div>
    </form>
  }

  function renderTributeBillet(billet: TributeBillet) {
    return <form >
      <div><label>Tipo: {billet instanceof BankBillet ? "Bancário" : "Tributo"}</label></div>
      <div><label>Código de barras: {billet?.toBarcode()}</label></div>
      <div><label>Linha digitável: {maskTributeBillet(billet?.toLine())}</label></div>
      <div><label>Valor: R$ {(Number(billet?.getBillet().value || 0)/100).toFixed(2)}</label></div>
      <div><label>------------------------</label></div>
      <div><label>Identificador: {billet?.getBillet().identifier}</label></div>
      <div><label>Segmento: {billet?.getBillet().segment}</label></div>open_field
      <div><label>Empresa: {billet?.getBillet().business}</label></div>
      <div><label>Campos abertos: {billet?.getBillet().open_field}</label></div>
    </form>
  }

  function randomizeBankBillet() {
    setBillet(BankBillet.createBillet(Math.round(Math.random()*5000), 30))
  }

  function randomizeTributeBillet() {
    setBillet(TributeBillet.createBillet(Math.round(Math.random()*5000)))
  }

  return (
    <div className="App">
      <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <label>Boletos</label>
      </header>
      <div className="App-body">
        <GitHubForkRibbon position="right" 
                          color="orange"
                          href="//github.com/led-startup-studio/boletos" 
                          target="_blank" > 
          Fork me on GitHub 
        </GitHubForkRibbon> 
        <div>
          <label>
            Código de barras ou linha digitável:
          </label>
          <InputMask
            className="Barcode-input"
            mask={barcodeMask}
            onChange={e => {
              e.target.value.startsWith("8") ? 
                setBarcodeMask(tributeBilletMask) :
                setBarcodeMask(bankBilletMask);
              const unmasked = e.target.value.replace(new RegExp(/[^0-9]+/, 'g'), '')
              parseBillet(unmasked)
            }}
            />
        </div>
        <div>
          <button className="Barcode-random" onClick={randomizeBankBillet} >Gerar Bancário</button>
          <button className="Barcode-random" onClick={randomizeTributeBillet}>Gerar Tributo</button>
        </div>
        { billet && <div className="Barcode-output">
            {(billet instanceof BankBillet) && renderBankBillet(billet)}
            {(billet instanceof TributeBillet) && renderTributeBillet(billet)}
        </div> }
      </div>
      <div className="App-footer">
        <label>© 2020 LED Startup Studio</label>
      </div>
    </div>
  );
}

export default App;

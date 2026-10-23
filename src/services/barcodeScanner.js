// Loaded only after the user opens the scanner. Frames stay on this device.
export async function startBarcodeCamera(video,onCode){
 const {BrowserMultiFormatOneDReader}=await import('@zxing/browser');
 const reader=new BrowserMultiFormatOneDReader();
 let controls=null,stopped=false;
 const stop=()=>{stopped=true;controls?.stop();const stream=video.srcObject;stream?.getTracks?.().forEach(track=>track.stop());video.srcObject=null;};
 const ready=reader.decodeFromConstraints({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}}},video,(result,_error,session)=>{
  if(result&&!stopped){stopped=true;session.stop();onCode(result.getText());}
 }).then(session=>{controls=session;if(stopped)stop();return stop;});
 return {stop,ready};
}

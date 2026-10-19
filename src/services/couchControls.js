export function couchControl(gamepad){
 if(!gamepad||gamepad.mapping!=='standard')return null;
 const pressed=index=>gamepad.buttons?.[index]?.pressed;
 if(pressed(1))return 'back';if(pressed(0))return 'open';if(pressed(4))return 'previous';if(pressed(5))return 'next';
 if(pressed(12)||(gamepad.axes?.[1]||0)<-.55)return 'up';if(pressed(13)||(gamepad.axes?.[1]||0)>.55)return 'down';if(pressed(14)||(gamepad.axes?.[0]||0)<-.55)return 'left';if(pressed(15)||(gamepad.axes?.[0]||0)>.55)return 'right';return null;
}
export function couchIndex(index,direction,count,columns=4){if(!count)return 0;const step={left:-1,right:1,up:-columns,down:columns}[direction]||0;return Math.min(count-1,Math.max(0,index+step));}

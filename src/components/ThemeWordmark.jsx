import {getThemeTypography,themeTypographyClass} from '../data/themeTypography';
import './ThemeWordmark.css';

export default function ThemeWordmark({theme,children='Checkpoint',className=''}){
 const variant=getThemeTypography(theme);
 if(!variant)return <span className={className}>{children}</span>;
 return <span className={`theme-wordmark ${themeTypographyClass(theme)} ${className}`} data-wordmark-theme={theme}>{children}</span>;
}

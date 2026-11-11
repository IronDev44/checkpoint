import {forwardRef} from 'react';
import {catalogVisualSource} from '../services/catalogVisualRights';

// Resolve before rendering: a blocked catalogue asset is never requested first.
const CatalogImage=forwardRef(function CatalogImage({src,srcSet,...props},ref){
 const resolved=catalogVisualSource(src);
 return <img {...props} ref={ref} src={resolved} srcSet={resolved===src?srcSet:undefined}/>;
});
export default CatalogImage;

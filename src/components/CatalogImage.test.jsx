import {render,screen} from '@testing-library/react';
import CatalogImage from './CatalogImage';

// Exercise a specifically approved replacement without masking production logos.
jest.mock('../data/catalogVisualRights.json',()=>({replacements:[
 {url:'/images/brands/steam.png',replacement:'/images/checkpoint-platform.svg'},
 {url:'/images/brands/apple.png',replacement:'/images/checkpoint-platform.svg'},
]}));

test('resolves brand files before rendering, including old profile URLs and srcSet',()=>{
 const view=render(<CatalogImage src="/images/brands/steam.png" srcSet="/images/brands/steam.png 2x" alt="Steam" className="brand-logo"/>);
 expect(screen.getByAltText('Steam')).toHaveAttribute('src','/images/checkpoint-platform.svg');
 expect(screen.getByAltText('Steam')).not.toHaveAttribute('srcset');
 expect(screen.getByAltText('Steam')).toHaveClass('brand-logo');
 view.rerender(<CatalogImage src="https://checkpoint-eka.pages.dev/images/brands/apple.png?v=1" alt="Apple"/>);
 expect(screen.getByAltText('Apple')).toHaveAttribute('src','/images/checkpoint-platform.svg');
});

test('keeps personal photos and unlisted images unchanged',()=>{
 const view=render(<CatalogImage src="data:image/png;base64,photo" alt="Mon matériel"/>);
 expect(screen.getByAltText('Mon matériel')).toHaveAttribute('src','data:image/png;base64,photo');
 view.rerender(<CatalogImage src="https://example.org/photo.png" srcSet="https://example.org/photo@2x.png 2x" alt="Mon matériel"/>);
 expect(screen.getByAltText('Mon matériel')).toHaveAttribute('srcset','https://example.org/photo@2x.png 2x');
});

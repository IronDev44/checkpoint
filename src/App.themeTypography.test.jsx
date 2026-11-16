import {render,screen} from '@testing-library/react';
import {AppHeaderBrand} from './App';

test('switching themes updates the signature and restores neutral and 2077 headers',()=>{
 const view=render(<AppHeaderBrand theme="theme-tamer"/>);
 expect(screen.getByRole('heading')).toHaveClass('has-theme-wordmark');
 expect(document.querySelector('[data-wordmark-theme]')).toHaveAttribute('data-wordmark-theme','theme-tamer');
 view.rerender(<AppHeaderBrand theme="theme-cubic"/>);
 expect(document.querySelector('[data-wordmark-theme]')).toHaveAttribute('data-wordmark-theme','theme-cubic');
 expect(document.querySelector('.theme-typography--capture')).toBeNull();
 view.rerender(<AppHeaderBrand theme="theme-checkpoint"/>);
 expect(screen.getByRole('heading')).not.toHaveClass('has-theme-wordmark');
 expect(document.querySelector('.theme-wordmark')).toBeNull();
 expect(document.querySelector('.checkpoint-header-mark')).not.toBeNull();
 view.rerender(<AppHeaderBrand theme="theme-checkpoint2077"/>);
 expect(screen.getByLabelText('Checkpoint 2077')).toBeInTheDocument();
 expect(document.querySelector('.cp2077-brush')).not.toBeNull();
 expect(document.querySelector('.theme-wordmark')).toBeNull();
});

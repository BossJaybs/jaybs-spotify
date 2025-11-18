-- Insert sample artists
INSERT INTO public.artists (name, bio, image_url) VALUES
  ('The Weeknd', 'Canadian singer and songwriter', 'https://via.placeholder.com/150?text=The+Weeknd'),
  ('Billie Eilish', 'American singer and songwriter', 'https://via.placeholder.com/150?text=Billie+Eilish'),
  ('Dua Lipa', 'British-Kosovar singer', 'https://via.placeholder.com/150?text=Dua+Lipa'),
  ('The Beatles', 'Legendary British rock band', 'https://via.placeholder.com/150?text=The+Beatles');

-- Insert sample songs
INSERT INTO public.songs (title, artist_id, duration, audio_url, image_url) VALUES
  ('Blinding Lights', (SELECT id FROM public.artists WHERE name = 'The Weeknd' LIMIT 1), 200, 'https://via.placeholder.com/audio.mp3', 'https://via.placeholder.com/300?text=Blinding+Lights'),
  ('Starboy', (SELECT id FROM public.artists WHERE name = 'The Weeknd' LIMIT 1), 230, 'https://via.placeholder.com/audio.mp3', 'https://via.placeholder.com/300?text=Starboy'),
  ('Bad Guy', (SELECT id FROM public.artists WHERE name = 'Billie Eilish' LIMIT 1), 194, 'https://via.placeholder.com/audio.mp3', 'https://via.placeholder.com/300?text=Bad+Guy'),
  ('Levitating', (SELECT id FROM public.artists WHERE name = 'Dua Lipa' LIMIT 1), 203, 'https://via.placeholder.com/audio.mp3', 'https://via.placeholder.com/300?text=Levitating'),
  ('Yesterday', (SELECT id FROM public.artists WHERE name = 'The Beatles' LIMIT 1), 125, 'https://via.placeholder.com/audio.mp3', 'https://via.placeholder.com/300?text=Yesterday'),
  ('Hey Jude', (SELECT id FROM public.artists WHERE name = 'The Beatles' LIMIT 1), 427, 'https://via.placeholder.com/audio.mp3', 'https://via.placeholder.com/300?text=Hey+Jude');

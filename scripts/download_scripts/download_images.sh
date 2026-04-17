#!/bin/bash
# Create directories
mkdir -p frontend/public/cover-images/{general,social,professional,arts,sports,food,wellness,tech}

# General
curl -sL "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&h=630&fit=crop" -o frontend/public/cover-images/general/01-community.jpg
curl -sL "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&h=630&fit=crop" -o frontend/public/cover-images/general/02-audience.jpg
curl -sL "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=630&fit=crop" -o frontend/public/cover-images/general/03-conference.jpg
curl -sL "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=630&fit=crop" -o frontend/public/cover-images/general/04-stage.jpg
curl -sL "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&h=630&fit=crop" -o frontend/public/cover-images/general/05-speaker.jpg

# Social
curl -sL "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&h=630&fit=crop" -o frontend/public/cover-images/social/01-party.jpg
curl -sL "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=630&fit=crop" -o frontend/public/cover-images/social/02-concert.jpg
curl -sL "https://images.unsplash.com/photo-1519671482749-fd09be4cce9?w=1200&h=630&fit=crop" -o frontend/public/cover-images/social/03-toast.jpg
curl -sL "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=1200&h=630&fit=crop" -o frontend/public/cover-images/social/04-wedding.jpg
curl -sL "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=1200&h=630&fit=crop" -o frontend/public/cover-images/social/05-festival.jpg

# Professional
curl -sL "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&h=630&fit=crop" -o frontend/public/cover-images/professional/01-meeting.jpg
curl -sL "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&h=630&fit=crop" -o frontend/public/cover-images/professional/02-handshake.jpg
curl -sL "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=630&fit=crop" -o frontend/public/cover-images/professional/03-workspace.jpg
curl -sL "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=630&fit=crop" -o frontend/public/cover-images/professional/04-team.jpg
curl -sL "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&h=630&fit=crop" -o frontend/public/cover-images/professional/05-presentation.jpg

# Arts
curl -sL "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&h=630&fit=crop" -o frontend/public/cover-images/arts/01-gallery.jpg
curl -sL "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200&h=630&fit=crop" -o frontend/public/cover-images/arts/02-music.jpg
curl -sL "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&h=630&fit=crop" -o frontend/public/cover-images/arts/03-festival.jpg
curl -sL "https://images.unsplash.com/photo-1459749411177-0473ef7161cf?w=1200&h=630&fit=crop" -o frontend/public/cover-images/arts/04-concert.jpg
curl -sL "https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?w=1200&h=630&fit=crop" -o frontend/public/cover-images/arts/05-performance.jpg

# Sports
curl -sL "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&h=630&fit=crop" -o frontend/public/cover-images/sports/01-yoga.jpg
curl -sL "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&h=630&fit=crop" -o frontend/public/cover-images/sports/02-running.jpg
curl -sL "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&h=630&fit=crop" -o frontend/public/cover-images/sports/03-fitness.jpg
curl -sL "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&h=630&fit=crop" -o frontend/public/cover-images/sports/04-athlete.jpg
curl -sL "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=630&fit=crop" -o frontend/public/cover-images/sports/05-gym.jpg

# Food
curl -sL "https://images.unsplash.com/photo-1555244162-803794f237d3?w=1200&h=630&fit=crop" -o frontend/public/cover-images/food/01-dinner.jpg
curl -sL "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=630&fit=crop" -o frontend/public/cover-images/food/02-restaurant.jpg
curl -sL "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1200&h=630&fit=crop" -o frontend/public/cover-images/food/03-brunch.jpg
curl -sL "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=630&fit=crop" -o frontend/public/cover-images/food/04-catering.jpg
curl -sL "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1200&h=630&fit=crop" -o frontend/public/cover-images/food/05-drinks.jpg

# Wellness
curl -sL "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&h=630&fit=crop" -o frontend/public/cover-images/wellness/01-meditation.jpg
curl -sL "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&h=630&fit=crop" -o frontend/public/cover-images/wellness/02-yoga.jpg
curl -sL "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&h=630&fit=crop" -o frontend/public/cover-images/wellness/03-wellness.jpg
curl -sL "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&h=630&fit=crop" -o frontend/public/cover-images/wellness/04-exercise.jpg
curl -sL "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&h=630&fit=crop" -o frontend/public/cover-images/wellness/05-relax.jpg

# Tech
curl -sL "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=630&fit=crop" -o frontend/public/cover-images/tech/01-hackathon.jpg
curl -sL "https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=1200&h=630&fit=crop" -o frontend/public/cover-images/tech/02-coworking.jpg
curl -sL "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&h=630&fit=crop" -o frontend/public/cover-images/tech/03-meeting.jpg
curl -sL "https://images.unsplash.com/photo-1556761175-413bceb1bf3e?w=1200&h=630&fit=crop" -o frontend/public/cover-images/tech/04-team.jpg
curl -sL "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=630&fit=crop" -o frontend/public/cover-images/tech/05-office.jpg

echo "Download complete! Check frontend/public/cover-images/"

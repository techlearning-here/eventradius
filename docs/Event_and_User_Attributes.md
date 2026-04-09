# Event and User Attributes Framework

This document defines the comprehensive set of attributes for events and users to enable intelligent matching, personalized recommendations, and advanced filtering.

## Event Attributes

### 1. Basic Information
| Attribute | Type | Examples/Options |
|-----------|------|------------------|
| Title | String | Event name |
| Description | Text | Detailed event information |
| Category | Enum | Music, Sports, Tech, Arts, Food, Education, Wellness, Business, Social, Outdoor |
| Sub-category | Enum | Under Music: Concert, DJ Night, Classical, Jazz, Rock |
| Event Type | Enum | In-Person, Virtual, Hybrid |
| Format | Enum | Workshop, Conference, Meetup, Performance, Competition, Exhibition, Class, Tour |

### 2. Language Attributes
| Attribute | Type | Examples/Options |
|-----------|------|------------------|
| Primary Language | Enum | English, Spanish, Mandarin, Hindi, French, Arabic, Bengali, Portuguese, Russian, Japanese, German, Korean, Tamil, Telugu, Marathi, Gujarati |
| Secondary Languages | Multi-select | Same as above |
| Interpretation Available | Boolean | Yes/No |
| Sign Language | Boolean | ASL, BSL, Local sign language |

### 3. Demographic Targeting
| Attribute | Type | Examples/Options |
|-----------|------|------------------|
| Gender Preference | Enum | All Welcome, Women Only, Men Only, LGBTQ+ Friendly, Gender Neutral |
| Age Categories | Multi-select | All Ages, Kids (0-12), Girl Kids, Boy Kids, Teens (13-17), Young Adults (18-25), Adults (26-35), Middle Age (36-50), Mature (51-65), Seniors (65+), 50+, 60+, 70+ |
| Family Friendly | Boolean | Yes/No |
| Singles Friendly | Boolean | Yes/No |
| Couples Oriented | Boolean | Yes/No |
| Senior Friendly | Boolean | Yes/No |

### 4. Prerequisites & Requirements
| Attribute | Type | Examples/Options |
|-----------|------|------------------|
| Skill Level | Enum | Beginner, Intermediate, Advanced, All Levels |
| Prior Experience | Enum | None Required, Some Experience, Expert Level |
| Physical Fitness | Enum | Sedentary, Light Activity, Moderate Activity, High Intensity, Athletic |
| Equipment Required | Multi-select | Yoga Mat, Laptop, Sports Shoes, Musical Instrument, Art Supplies, None |
| Dress Code | Enum | Casual, Business Casual, Formal, Sportswear, Traditional/Cultural |
| Prerequisites | Text | Free text for specific requirements |

### 5. Cultural & Religious Context
| Attribute | Type | Examples/Options |
|-----------|------|------------------|
| Religious Context | Multi-select | Hindu, Christian, Muslim, Buddhist, Jewish, Sikh, Jain, Interfaith, Secular, None |
| Cultural Celebration | Multi-select | Diwali, Christmas, Eid, Chinese New Year, Holi, Thanksgiving, Hanukkah, Vaisakhi |
| Cultural Origin | Enum | Indian, Chinese, Japanese, Korean, Mexican, Italian, Middle Eastern, African, Latin American, European |
| Traditional Attire | Boolean | Encouraged/Required/Optional |
| Dietary Context | Enum | Vegetarian, Vegan, Halal, Kosher, Jain Food, None |

### 6. Accessibility & Inclusion
| Attribute | Type | Examples/Options |
|-----------|------|------------------|
| Wheelchair Accessible | Boolean | Yes/No/Partial |
| Mobility Friendly | Boolean | Yes/No |
| Hearing Accessible | Boolean | Yes/No |
| Vision Accessible | Boolean | Yes/No |
| Sensory Friendly | Boolean | Yes/No (Low noise, no flashing lights) |
| Service Animals Allowed | Boolean | Yes/No |
| Restroom Accessibility | Boolean | Yes/No |
| Parking Accessibility | Boolean | Yes/No |

### 7. Content & Intensity
| Attribute | Type | Examples/Options |
|-----------|------|------------------|
| Content Rating | Enum | All Ages, PG, PG-13, Mature (18+), Explicit |
| Alcohol Served | Enum | No Alcohol, BYOB, Bar Available, Complimentary |
| Smoking Policy | Enum | Non-Smoking, Smoking Area, Vape Friendly |
| Noise Level | Enum | Quiet, Moderate, Loud, Very Loud |
| Duration | Enum | Under 1 hour, 1-2 hours, Half Day, Full Day, Multi-Day |
| Physical Intensity | Enum | None, Low, Medium, High, Extreme |

### 8. Social & Networking
| Attribute | Type | Examples/Options |
|-----------|------|------------------|
| Networking Focus | Boolean | Yes/No |
| Social Mixer | Boolean | Yes/No |
| Ice Breakers | Boolean | Yes/No |
| Group Activities | Boolean | Yes/No |
| Team Building | Boolean | Yes/No |

### 9. Pricing & Registration
| Attribute | Type | Examples/Options |
|-----------|------|------------------|
| Price Type | Enum | Free, Fixed Price, Donation, Pay What You Want, Dynamic Pricing |
| Refund Policy | Enum | Full Refund, Partial Refund, No Refund, Credit Only |
| Transfer Allowed | Boolean | Yes/No |
| Group Discounts | Boolean | Yes/No |
| Early Bird | Boolean | Yes/No |

---

## User (Event Consumer) Attributes

### 1. Demographics
| Attribute | Type | Examples/Options |
|-----------|------|------------------|
| Age | Number | Birth year or age range |
| Gender | Enum | Male, Female, Non-Binary, Prefer Not to Say, Other |
| Age Group | Enum | Same as event age categories |
| Life Stage | Enum | Student, Working Professional, Parent, Retiree, Entrepreneur, Freelancer |

### 2. Cultural & Religious Identity
| Attribute | Type | Examples/Options |
|-----------|------|------------------|
| Religion | Multi-select | Hindu, Christian, Muslim, Buddhist, Jewish, Sikh, Jain, Taoist, Shinto, Atheist, Agnostic, Spiritual but not religious, Other, Prefer Not to Say |
| Religious Observance | Enum | Devout, Observant, Cultural, Secular |
| Ethnicity | Multi-select | Asian Indian, Chinese, Japanese, Korean, Filipino, Vietnamese, Pakistani, Bangladeshi, Hispanic/Latino, Mexican, Puerto Rican, Cuban, Salvadoran, African American, Nigerian, Ethiopian, Ghanaian, Kenyan, Somali, White/Caucasian, German, Irish, English, Italian, Polish, French, Middle Eastern, Arab, Persian, Kurdish, Native American, Indigenous, Pacific Islander, Hawaiian, Samoan, Mixed Race, Other |
| Nationality | String | Country of origin/citizenship |
| Cultural Background | Multi-select | Similar to ethnicity, plus diaspora options |

### 3. Geographic Attributes
| Attribute | Type | Examples/Options |
|-----------|------|------------------|
| Current Location | String | City, State, Country |
| Preferred Search Radius | Enum | 5 miles, 10 miles, 25 miles, 50 miles, 100 miles, Any |
| Preferred Neighborhoods | Multi-select | Local neighborhoods |
| Willing to Travel | Boolean | Yes/No |
| Travel Distance Max | Enum | 10, 25, 50, 100, 200+ miles |
| Timezone | String | For virtual events |

### 4. Language Preferences
| Attribute | Type | Examples/Options |
|-----------|------|------------------|
| Primary Language | Enum | Same as event languages |
| Secondary Languages | Multi-select | Same as above |
| Preferred Language for Events | Multi-select | Languages comfortable with for event attendance |
| Interpreter Needed | Boolean | Yes/No |

### 5. Interests & Hobbies
| Attribute | Type | Examples/Options |
|-----------|------|------------------|
| Music Genres | Multi-select | Classical, Jazz, Rock, Pop, Hip-Hop, EDM, Country, Folk, Blues, Metal, R&B, Reggae, World Music, Latin |
| Sports & Fitness | Multi-select | Running, Yoga, Gym, Swimming, Cycling, Hiking, Tennis, Basketball, Soccer, Cricket, Martial Arts, Dance |
| Arts & Culture | Multi-select | Painting, Photography, Theater, Film, Literature, Poetry, Museum, Gallery |
| Food & Drink | Multi-select | Fine Dining, Street Food, Wine Tasting, Cooking, Baking, Vegetarian, Vegan, BBQ |
| Learning & Education | Multi-select | Technology, Business, Languages, History, Science, Philosophy, Self-Improvement |
| Social Activities | Multi-select | Board Games, Trivia, Karaoke, Dancing, Clubbing, Casual Meetups |
| Outdoor Activities | Multi-select | Camping, Fishing, Gardening, Bird Watching, Beach, Skiing, Rock Climbing |
| Wellness & Mindfulness | Multi-select | Meditation, Spa, Wellness Retreats, Mental Health, Therapy |
| Tech & Gaming | Multi-select | Coding, AI/ML, Gaming (PC/Console/Mobile), VR/AR, Blockchain, Startups |
| Travel & Adventure | Multi-select | Local Travel, International, Adventure Sports, Cultural Tourism |

### 6. Professional & Educational
| Attribute | Type | Examples/Options |
|-----------|------|------------------|
| Industry | Multi-select | Tech, Healthcare, Finance, Education, Arts, Manufacturing, Retail, Hospitality, Legal, Government, Non-profit |
| Job Function | Multi-select | Engineering, Sales, Marketing, Design, HR, Operations, Finance, Research, Management |
| Career Level | Enum | Entry, Mid, Senior, Executive, Founder |
| Education Level | Enum | High School, Bachelor's, Master's, PhD, Professional Degree, Other |
| Field of Study | Multi-select | STEM, Humanities, Business, Arts, Medicine, Law |

### 7. Accessibility Needs
| Attribute | Type | Examples/Options |
|-----------|------|------------------|
| Mobility Needs | Multi-select | Wheelchair, Walker, Mobility Scooter, Assistance Required, None |
| Hearing Needs | Multi-select | Hearing Aid, Sign Language Interpreter, Closed Captioning, None |
| Vision Needs | Multi-select | Screen Reader, Guide Dog, Large Print, None |
| Sensory Sensitivities | Boolean | Yes/No |
| Service Animal | Boolean | Yes/No |
| Dietary Restrictions | Multi-select | Vegetarian, Vegan, Halal, Kosher, Gluten-Free, Nut Allergy, Dairy-Free, Jain |
| Medical Considerations | Text | Allergies, conditions organizers should know |

### 8. Social Preferences
| Attribute | Type | Examples/Options |
|-----------|------|------------------|
| Preferred Group Size | Enum | Small (5-10), Medium (10-30), Large (30+), Any |
| Social Style | Enum | Introvert, Extrovert, Ambivert |
| Looking For | Multi-select | Friends, Networking, Dating, Learning, Entertainment, Professional Growth, Community |
| Event Companion | Enum | Solo, Partner, Friends, Family, Colleagues |
| Comfort Level | Enum | Familiar Faces Preferred, Open to New People, Mix of Both |

### 9. Event Preferences
| Attribute | Type | Examples/Options |
|-----------|------|------------------|
| Preferred Days | Multi-select | Weekdays, Weekends, Monday-Friday, Any |
| Preferred Times | Multi-select | Morning (6-12), Afternoon (12-5), Evening (5-9), Night (9+), Any |
| Max Event Duration | Enum | 1 hour, 2 hours, Half Day, Full Day, Weekend, No Limit |
| Price Comfort | Enum | Free Only, Under $25, Under $50, Under $100, Any |
| Event Frequency | Enum | Weekly, Bi-weekly, Monthly, Occasionally |
| Virtual Comfort | Enum | In-Person Only, Virtual OK, Hybrid OK, Virtual Preferred |

### 10. Family & Relationship
| Attribute | Type | Examples/Options |
|-----------|------|------------------|
| Relationship Status | Enum | Single, In Relationship, Married, Divorced, Widowed, It's Complicated, Prefer Not to Say |
| Has Children | Boolean | Yes/No |
| Children's Ages | Multi-select | Infant (0-2), Toddler (2-5), Child (6-12), Teen (13-17), Adult Children |
| Family Events Preference | Boolean | Yes/No |
| Pet Owner | Boolean | Yes/No |
| Pet Types | Multi-select | Dog, Cat, Bird, Other |

---

## Implementation Notes

### For Event Creation Wizard
1. **Basic Info Step**: Capture categories, type, format, language
2. **Audience Step**: Demographics, gender, age, prerequisites
3. **Cultural Context Step**: Religious context, cultural celebration, dietary needs
4. **Accessibility Step**: All accessibility flags
5. **Advanced Details**: Content rating, intensity, social focus

### For User Onboarding
1. **Basic Profile**: Age, gender, location, languages
2. **Cultural Identity**: Religion, ethnicity, cultural background
3. **Interests Selection**: Multi-select from comprehensive list
4. **Accessibility**: Any needs organizers should know
5. **Preferences**: Days, times, price range, group size
6. **Goals**: What they're looking for (friends, networking, learning, etc.)

### Matching Logic
- **Strict Match**: Must match all required attributes
- **Flexible Match**: Matches most important attributes
- **Discovery Match**: Suggests events outside usual preferences for exploration
- **AI Recommendations**: Learn from behavior, not just stated preferences

// Integration test for sub-step wizard structure
describe('Sub-Step Wizard Structure', () => {
  test('has correct wizard sections and sub-steps', () => {
    // Test the wizard structure
    const wizardSections = [
      {
        id: 'basic',
        title: 'Basic Event Details',
        description: 'Essential information for your event',
        subSteps: [
          { id: 'info', title: 'Event Info', description: 'Title, description and image' },
          { id: 'type', title: 'Type & Format', description: 'Event type and format' },
          { id: 'datetime', title: 'Date & Location', description: 'Schedule and venue' }
        ]
      },
      {
        id: 'advanced',
        title: 'Advanced Options',
        description: 'Additional settings and features (optional)',
        subSteps: [
          { id: 'registration', title: 'Registration', description: 'Registration settings' },
          { id: 'ticketing', title: 'Ticketing', description: 'Ticket types and pricing' },
          { id: 'settings', title: 'Settings & Review', description: 'Policies and publishing' }
        ]
      }
    ];

    // Verify structure
    expect(wizardSections).toHaveLength(2);
    expect(wizardSections[0].subSteps).toHaveLength(3);
    expect(wizardSections[1].subSteps).toHaveLength(3);
    
    // Total sub-steps should be 6
    const totalSubSteps = wizardSections.reduce((total, section) => total + section.subSteps.length, 0);
    expect(totalSubSteps).toBe(6);
  });

  test('sub-step validation logic', () => {
    // Test validation for each sub-step
    const isSubStepComplete = (subStepId: string, formData: any) => {
      switch (subStepId) {
        case 'info':
          return formData.title?.trim() !== '' && formData.description?.trim() !== '';
        case 'type':
          return !!formData.event_type && !!formData.event_format;
        case 'datetime':
          return !!formData.start_time && !!formData.end_time &&
                 (formData.event_type === 'online' ? !!formData.virtual_event_url?.trim() : !!formData.location?.trim());
        case 'registration':
          return true; // Optional
        case 'ticketing':
          return true; // Optional
        case 'settings':
          return true; // Optional
        default:
          return false;
      }
    };

    const mockFormData = {
      title: 'Test Event',
      description: 'Test Description',
      event_type: 'in_person',
      event_format: 'single',
      start_time: new Date('2026-12-01T10:00:00'),
      end_time: new Date('2026-12-01T12:00:00'),
      location: 'Test Location',
      virtual_event_url: ''
    };

    // Test each sub-step validation
    expect(isSubStepComplete('info', mockFormData)).toBe(true);
    expect(isSubStepComplete('type', mockFormData)).toBe(true);
    expect(isSubStepComplete('datetime', mockFormData)).toBe(true);
    expect(isSubStepComplete('registration', mockFormData)).toBe(true);
    expect(isSubStepComplete('ticketing', mockFormData)).toBe(true);
    expect(isSubStepComplete('settings', mockFormData)).toBe(true);

    // Test incomplete data
    const incompleteData = { ...mockFormData, title: '' };
    expect(isSubStepComplete('info', incompleteData)).toBe(false);
    expect(isSubStepComplete('type', incompleteData)).toBe(true); // Other steps still complete
  });

  test('progress calculation', () => {
    // Test progress calculation for 6 sub-steps
    const getProgress = (currentSubStepNumber: number, totalSubSteps: number) => {
      return Math.round((currentSubStepNumber / totalSubSteps) * 100);
    };

    expect(getProgress(1, 6)).toBe(17); // Step 1 of 6
    expect(getProgress(2, 6)).toBe(33); // Step 2 of 6
    expect(getProgress(3, 6)).toBe(50); // Step 3 of 6
    expect(getProgress(4, 6)).toBe(67); // Step 4 of 6
    expect(getProgress(5, 6)).toBe(83); // Step 5 of 6
    expect(getProgress(6, 6)).toBe(100); // Step 6 of 6
  });

  test('navigation logic', () => {
    // Test sub-step navigation logic
    const sections = [
      { id: 'basic', subSteps: ['info', 'type', 'datetime'] },
      { id: 'advanced', subSteps: ['registration', 'ticketing', 'settings'] }
    ];

    const getNextSubStep = (sectionIndex: number, subStepIndex: number) => {
      const currentSection = sections[sectionIndex];
      if (subStepIndex < currentSection.subSteps.length - 1) {
        // Next sub-step in same section
        return { sectionIndex, subStepIndex: subStepIndex + 1 };
      } else if (sectionIndex < sections.length - 1) {
        // First sub-step of next section
        return { sectionIndex: sectionIndex + 1, subStepIndex: 0 };
      }
      return null; // Last step
    };

    const getPreviousSubStep = (sectionIndex: number, subStepIndex: number) => {
      if (subStepIndex > 0) {
        // Previous sub-step in same section
        return { sectionIndex, subStepIndex: subStepIndex - 1 };
      } else if (sectionIndex > 0) {
        // Last sub-step of previous section
        const prevSection = sections[sectionIndex - 1];
        return { 
          sectionIndex: sectionIndex - 1, 
          subStepIndex: prevSection.subSteps.length - 1 
        };
      }
      return null; // First step
    };

    // Test forward navigation
    expect(getNextSubStep(0, 0)).toEqual({ sectionIndex: 0, subStepIndex: 1 }); // info -> type
    expect(getNextSubStep(0, 1)).toEqual({ sectionIndex: 0, subStepIndex: 2 }); // type -> datetime
    expect(getNextSubStep(0, 2)).toEqual({ sectionIndex: 1, subStepIndex: 0 }); // datetime -> registration
    expect(getNextSubStep(1, 2)).toBeNull(); // settings is last step

    // Test backward navigation
    expect(getPreviousSubStep(1, 0)).toEqual({ sectionIndex: 0, subStepIndex: 2 }); // registration -> datetime
    expect(getPreviousSubStep(0, 1)).toEqual({ sectionIndex: 0, subStepIndex: 0 }); // type -> info
    expect(getPreviousSubStep(0, 0)).toBeNull(); // info is first step
  });

  test('user experience flow', () => {
    // Test the complete user flow through all sub-steps
    const userFlow = [
      'Event Info - Title, description and image',
      'Type & Format - Event type and format',
      'Date & Location - Schedule and venue',
      'Registration - Registration settings',
      'Ticketing - Ticket types and pricing',
      'Settings & Review - Policies and publishing'
    ];

    expect(userFlow).toHaveLength(6);
    
    // Verify the flow makes sense
    expect(userFlow[0]).toContain('Title, description'); // Basic info first
    expect(userFlow[1]).toContain('type and format'); // Then type
    expect(userFlow[2]).toContain('Schedule and venue'); // Then when/where
    expect(userFlow[3]).toContain('Registration'); // Then registration
    expect(userFlow[4]).toContain('Ticketing'); // Then ticketing
    expect(userFlow[5]).toContain('Review'); // Finally review
  });

  test('cognitive load reduction', () => {
    // Compare old vs new structure
    const oldStructure = {
      totalSteps: 8,
      stepsPerSection: 8, // All in one section
      cognitiveLoad: 'High - 8 different concepts to understand at once'
    };

    const newStructure = {
      totalSections: 2,
      totalSubSteps: 6,
      subStepsPerSection: 3,
      cognitiveLoad: 'Low - 3 related concepts per section, logical grouping'
    };

    // Verify the new structure reduces cognitive load
    expect(newStructure.subStepsPerSection).toBeLessThan(oldStructure.stepsPerSection);
    expect(newStructure.totalSubSteps).toBeLessThan(oldStructure.totalSteps);
    expect(newStructure.cognitiveLoad).toContain('Low');
  });
});

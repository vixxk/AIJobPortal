module.exports = {
  // LEVEL 1: Absolute Beginner
  1: [
    {
      title: "Meeting New People",
      content: "Ananya: Hello! My name is Ananya. What is your name?\nRahul: Hi, Ananya. My name is Rahul. It is nice to meet you.",
      vocabulary: [
        { word: "Hello", definition: "A friendly greeting." },
        { word: "Name", definition: "What people call you." }
      ],
      tasks: [
        { id: 1, type: "repeat", prompt: "Listen and repeat the greeting.", text_to_repeat: "Hello! My name is Ananya." },
        { id: 2, type: "repeat", prompt: "Now repeat Rahul's reply.", text_to_repeat: "Hi, Ananya. My name is Rahul." },
        { id: 3, type: "question", prompt: "What are the names of the two people?", correct_answer_hint: "Ananya and Rahul." }
      ]
    }
  ],
  // LEVEL 2: Beginner
  2: [
    {
      title: "My Daily Routine",
      content: "Rohit: I wake up at seven o'clock every morning. First, I brush my teeth. Then, I eat parathas and drink chai for breakfast.",
      vocabulary: [
        { word: "Routine", definition: "Things you do every day." },
        { word: "Breakfast", definition: "The first meal of the day." }
      ],
      tasks: [
        { id: 1, type: "repeat", prompt: "Repeat exactly what Rohit does first.", text_to_repeat: "First, I brush my teeth." },
        { id: 2, type: "describe_image", prompt: "Describe the food you see in this picture.", image_url: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=800&auto=format&fit=crop" },
        { id: 3, type: "question", prompt: "What time does Rohit wake up?", correct_answer_hint: "He wakes up at seven o'clock." },
        { id: 4, type: "free_speech", prompt: "What do you usually eat for breakfast?" }
      ]
    }
  ],
  // LEVEL 3: Elementary
  3: [
    {
      title: "Planning a Weekend Trip",
      content: "Priya: The weather is going to be sunny this weekend. Do you want to go to the market with me?\nArjun: That sounds like a great idea! We can shop and eat some street food.",
      vocabulary: [
        { word: "Weekend", definition: "Saturday and Sunday." },
        { word: "Market", definition: "A public place where people buy and sell things." }
      ],
      tasks: [
        { id: 1, type: "describe_image", prompt: "What activities are happening in this sunny picture?", image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop" },
        { id: 2, type: "roleplay", prompt: "I am Priya. Tell me what you want to do at the market.", roleplay_scenario: "Respond to Priya's invitation and suggest a fun activity." }
      ]
    }
  ],
  // LEVEL 4: Pre-Intermediate
  4: [
    {
      title: "A Job Interview",
      content: "Manager: Welcome to our office. Can you tell me about your previous work experience?\nVikram: Thank you. I worked as a software consultant for three years. I enjoyed helping clients and solving their technical problems in Bangalore.\nManager: That is excellent. We are looking for someone who is friendly and organized.",
      vocabulary: [
        { word: "Experience", definition: "Knowledge gained from doing a job." },
        { word: "Organized", definition: "Able to plan things carefully and keep things neat." }
      ],
      tasks: [
        { id: 1, type: "question", prompt: "How long did Vikram work as a software consultant?", correct_answer_hint: "Three years." },
        { id: 2, type: "roleplay", prompt: "I will be the manager. You tell me why you want to work here.", roleplay_scenario: "You are applying for a job as a manager. Explain why you are the best person for it." },
        { id: 3, type: "idiom_usage", prompt: "Try to use this phrase when talking about being organized at work.", target_idiom: "stay on top of things" },
        { id: 4, type: "free_speech", prompt: "What makes a good employee in your opinion?" }
      ]
    }
  ],
  // LEVEL 5: Intermediate
  5: [
    {
      title: "Dealing with Stress",
      content: "Neha: I have been feeling incredibly overwhelmed lately with all the deadlines at work and traffic during my commute.\nKabir: You should try to take short breaks. When I feel stressed, I usually go for a quick walk outside to clear my head.",
      vocabulary: [
        { word: "Overwhelmed", definition: "Feeling like you have too much to handle." },
        { word: "Deadline", definition: "The time by which something must be finished." }
      ],
      tasks: [
        { id: 1, type: "describe_image", prompt: "Describe how the person in this picture looks like they are feeling.", image_url: "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=800&auto=format&fit=crop" },
        { id: 2, type: "roleplay", prompt: "I am feeling very tired and stressed about a big project. Give me some advice on what to do.", roleplay_scenario: "Comfort a friend who is stressed out and suggest a relaxing activity." },
        { id: 3, type: "debate", prompt: "Argue your stance on working hard versus taking breaks.", debate_stance: "Taking frequent breaks actually makes you more productive than working 8 hours straight." }
      ]
    }
  ],
  // LEVEL 6: Upper-Intermediate
  6: [
    {
      title: "The Impact of Technology",
      content: "Technology has drastically altered the way we communicate. While smartphones keep us constantly connected, some argue they actually diminish the quality of our face-to-face interactions. We often prioritize scrolling through social media feeds over engaging in meaningful conversations with the people sitting directly across from us.",
      vocabulary: [
        { word: "Drastically", definition: "In a way that is severe and sudden." },
        { word: "Diminish", definition: "To make or become less." },
        { word: "Prioritize", definition: "To treat something as being more important than other things." }
      ],
      tasks: [
        { id: 1, type: "repeat", prompt: "Practice saying this complex sentence naturally.", text_to_repeat: "While smartphones keep us connected, they diminish face-to-face interactions." },
        { id: 2, type: "describe_image", prompt: "Explain what message this image is sending about society's technology use.", image_url: "https://images.unsplash.com/photo-1512314889357-e157c22f938d?q=80&w=800&auto=format&fit=crop" },
        { id: 3, type: "idiom_usage", prompt: "Discuss the pros and cons of smartphones using this idiom.", target_idiom: "a double-edged sword" },
        { id: 4, type: "free_speech", prompt: "Do you believe social media brings people closer together or pushes them apart?" },
        { id: 5, type: "roleplay", prompt: "I think smartphones are ruining relationships. Disagree with me politely but firmly.", roleplay_scenario: "Argue the positive aspects of technology in long-distance connections." }
      ]
    }
  ],
  // LEVEL 7: Advanced
  7: [
    {
      title: "Environmental Responsibility",
      content: "The escalating climate crisis necessitates immediate corporate accountability. It is no longer sufficient for multinational companies to merely implement superficial recycling programs. They must adopt sustainable manufacturing processes and significantly reduce their carbon footprint, otherwise the ecological damage may become irreversible within the next decade.",
      vocabulary: [
        { word: "Escalating", definition: "Increasing rapidly." },
        { word: "Accountability", definition: "The fact of being responsible for what you do." },
        { word: "Irreversible", definition: "Impossible to change back to a previous condition." }
      ],
      tasks: [
        { id: 1, type: "describe_image", prompt: "Analyze the environmental threat shown in this image.", image_url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800&auto=format&fit=crop" },
        { id: 2, type: "debate", prompt: "Argue against this statement.", debate_stance: "Individual recycling is pointless unless large corporations change first." }
      ]
    }
  ],
  // LEVEL 8: Upper-Advanced
  8: [
    {
      title: "Navigating Office Politics",
      content: "Navigating the labyrinth of corporate politics often requires a delicate touch. You must learn how to read between the lines and understand the unspoken hierarchy. While some employees try to climb the ladder by stepping on toes, the truly successful leaders build bridges, turning potential adversaries into invaluable allies without compromising their own integrity.",
      vocabulary: [
        { word: "Labyrinth", definition: "A complicated series of paths; a maze." },
        { word: "Hierarchy", definition: "A system in which people are ranked above one another according to status." },
        { word: "Adversary", definition: "One's opponent in a conflict or dispute." }
      ],
      tasks: [
        { id: 1, type: "idiom_usage", prompt: "Explain your strategy for dealing with a difficult coworker.", target_idiom: "read between the lines" },
        { id: 2, type: "idiom_usage", prompt: "Explain how you would resolve a team conflict using this phrase.", target_idiom: "build bridges" },
        { id: 3, type: "debate", prompt: "Defend this controversial stance on corporate advancement.", debate_stance: "Office politics are a necessary evil that actually improves company efficiency." },
        { id: 4, type: "free_speech", prompt: "Have you ever had to navigate a tricky situation at work or school? Explain what happened." }
      ]
    }
  ],
  // LEVEL 9: Expert
  9: [
    {
      title: "The Ethics of Artificial Intelligence",
      content: "The proliferation of autonomous algorithms poses profound ethical dilemmas. If a self-driving vehicle is forced to choose between avoiding a pedestrian and swerving into oncoming traffic, whose life takes precedence? These unprecedented moral calculations can no longer be outsourced to purely logical heuristics; they demand rigorous philosophical scrutiny and robust legislative frameworks.",
      vocabulary: [
        { word: "Proliferation", definition: "Rapid increase in numbers." },
        { word: "Precedence", definition: "The condition of being considered more important than someone or something else." },
        { word: "Heuristics", definition: "A mental shortcut that allows people to solve problems and make judgments quickly." }
      ],
      tasks: [
        { id: 1, type: "describe_image", prompt: "Synthesize the meaning behind this conceptual technological dilemma.", image_url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop" },
        { id: 2, type: "debate", prompt: "Deliver a compelling 2-minute argument based on this stance.", debate_stance: "AI development should be heavily regulated by international governments immediately." },
        { id: 3, type: "idiom_usage", prompt: "Discuss the challenges lawmakers face regarding AI regulation.", target_idiom: "open a can of worms" }
      ]
    }
  ],
  // LEVEL 10: Master
  10: [
    {
      title: "Epistemology in the Post-Truth Era",
      content: "We find ourselves thrust into a post-truth paradigm where objective facts are increasingly subordinated to emotional appeals and entrenched dogmas. The decentralization of information dissemination has inadvertently birthed echo chambers that insulate individuals from cognitive dissonance. To counteract this epistemological crisis, society must cultivate a culture of relentless skepticism and rigorous media literacy.",
      vocabulary: [
        { word: "Paradigm", definition: "A typical example or pattern of something; a model." },
        { word: "Dogma", definition: "A principle or set of principles laid down by an authority as incontrovertibly true." },
        { word: "Epistemological", definition: "Relating to the theory of knowledge, especially with regard to its methods, validity, and scope." }
      ],
      tasks: [
        { id: 1, type: "debate", prompt: "You have 2 minutes. Construct a highly sophisticated counter-argument to this absolute premise.", debate_stance: "The concept of 'objective truth' is merely a societal construct and does not actually exist." }
      ]
    }
  ]
};

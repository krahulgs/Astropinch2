class NadiService:
    """
    Evaluates Nadi Astrological principles, particularly focusing on Karmic links.
    """
    
    def __init__(self):
        # Karmic pairs based on Nadi combinations
        self.karmic_rules = {
            ("Jupiter", "Ketu"): {
                "debt": "Spiritual or ancestral debt",
                "task": "Donate to a spiritual or educational cause this week."
            },
            ("Venus", "Rahu"): {
                "debt": "Relationship karma and illusions",
                "task": "Practice extreme honesty in a close relationship today."
            },
            ("Moon", "Saturn"): {
                "debt": "Emotional restriction and maternal karma",
                "task": "Feed stray animals or help an elderly person to ease emotional burdens."
            },
            ("Sun", "Rahu"): {
                "debt": "Ego and paternal karma",
                "task": "Perform a selfless act without seeking any recognition or credit."
            },
            ("Mars", "Ketu"): {
                "debt": "Aggression and past conflicts",
                "task": "Practice 10 minutes of deep meditation or anger management today."
            }
        }

    def evaluate_karmic_tasks(self, planets):
        """
        Detects specific planetary conjunctions (in the same sign or in 5/9 trine)
        and generates a personalized Nadi Karmic Task.
        """
        tasks = []
        
        # Check all pairs
        planet_items = list(planets.items())
        
        for i in range(len(planet_items)):
            for j in range(i + 1, len(planet_items)):
                name1, p1 = planet_items[i]
                name2, p2 = planet_items[j]
                
                # We identify Nadi connections if they are in the same sign (conjunction)
                # or in the 5th/9th sign from each other (Trinal Nadi connection)
                sign1 = p1["sign_id"]
                sign2 = p2["sign_id"]
                
                diff = abs(sign1 - sign2)
                
                if diff == 0 or diff == 4 or diff == 8:
                    # They are connected
                    pair1 = (name1, name2)
                    pair2 = (name2, name1)
                    
                    if pair1 in self.karmic_rules:
                        tasks.append(self.karmic_rules[pair1])
                    elif pair2 in self.karmic_rules:
                        tasks.append(self.karmic_rules[pair2])
                        
        # Remove duplicates
        unique_tasks = []
        seen_tasks = set()
        for t in tasks:
            if t["task"] not in seen_tasks:
                unique_tasks.append(t)
                seen_tasks.add(t["task"])
                
        # If no strict karmic tasks, return a default one based on Ascendant or generic
        if not unique_tasks:
            unique_tasks.append({
                "debt": "General balancing karma",
                "task": "Spend 15 minutes in quiet reflection or gratitude today."
            })
            
        return unique_tasks

from collections import defaultdict

def group_feedback(results):

    grouped = defaultdict(list)

    for item in results:
        grouped[item["topic"]].append(item)

    return grouped
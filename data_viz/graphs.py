import numpy as np
import random
import numpy.matlib
import math
import csv
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker


with open("part3_data.csv") as csv_file:
    data = []
    labels = []
    csv_reader = csv.reader(csv_file, delimiter=",")
    x = []
    for row in csv_reader:
        if row[0] == "#":
            labels += row[5:11]
        if row[1] == "Pikachu":
            data += row[5:11]
        if row[4] != "Total":
            x.append(int(row[4]))

    plt.pie(data, labels = labels, autopct = '%1.1f%%')
    plt.title("Pikachu's fighting attribute breakdown")
    plt.show()



    spacing = 10
    plt.hist(x, 10)
    plt.xlabel("Overall fighting attribute")
    plt.ylabel("No. of pokemon")
    plt.title("Distribution of overall fighting ability across Pokemon")

    plt.show()
